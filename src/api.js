const assert = require('assert');
const cloneDeep = require('lodash/cloneDeep');
const get = require('lodash/get');
const each = require('lodash/each');
const j2s = require('joi-to-swagger');
const generator = require('./generator');

class SwaggerAPI {
    constructor() {
        this.apiRoutes = [];
    }

    /**
     * Add a `koa-joi-router` router to the API.
     * @param {Router} router - koa-joi-router instance
     * @param {object} options
     * @param {string} [options.prefix]
     */
    addJoiRouter(router, options) {
        options = options || {};

        if (typeof options === 'string') {
            options = { prefix: options };
        }

        if (!Array.isArray(router.routes)) {
            throw new TypeError('router does not have exposed .routes array (not a joi-router instance)');
        }

        const prefix = get(router, 'router.opts.prefix');
        router.routes.forEach(function addRoute(route) {
            this.apiRoutes.push({
                route,
                prefix: options.prefix || prefix,
            });
        }, this);
    }

    /**
     * Generate a Swagger 2.0 specification as an object for this API.
     *
     * @param {object} baseSpec - base document
     * @param {object} baseSpec.info
     * @param {string} baseSpec.info.title
     * @param {string} baseSpec.info.version
     * @param {object} baseSpec.tags
     * @param {string} baseSpec.tags.name
     * @param {string} baseSpec.tags.description
     * @param {object} [options]
     * @param {object} [options.warnFunc]
     * @param {object} [options.defaultResponses]
     * @param {object} [options.definitions]
     * @returns {object} swagger 2.0 specification
     */
    generateSpec(baseSpec, options) {
        options = {
            warnFunc: console.warn,
            defaultResponses: {
                200: {
                    description: 'Success',
                },
                400: {
                    description: 'Bad Request',
                },
                500: {
                    description: 'Failure',
                },
            },
            ...options,
        };

        assert(baseSpec.info, 'baseSpec.info parameter missing');
        assert(baseSpec.info.title, 'baseSpec.info.title parameter missing');
        assert(baseSpec.info.version, 'baseSpec.info.version parameter missing');

        if (!options.defaultResponses) {
            options.defaultResponses = {};
        }

        Object.freeze(options.defaultResponses);

        if (baseSpec.definitions) {
            for (const key in baseSpec.definitions) {
                const val = baseSpec.definitions[key];
                // if it's not a swagger object, convert it
                if (val && val.type !== 'object' && !val.properties) {
                    baseSpec.definitions[key] = j2s(val).swagger;
                }
            }
        }

        const doc = cloneDeep(baseSpec);
        doc.swagger = '2.0';
        doc.paths = doc.paths || {};
        doc.tags = doc.tags || [];

        this.apiRoutes.forEach(function (apiRoute) {
            const routeOptions = { ...options, prefix: apiRoute.prefix };

            /**
             * Caching All `class-validator` Schemas
             */
            try {
                require('reflect-metadata');
                const { getFromContainer, MetadataStorage } = require('class-validator');
                const { validationMetadatasToSchemas } = require('class-validator-jsonschema');
                const metadatas = getFromContainer(MetadataStorage).validationMetadatas;
                const schemas = validationMetadatasToSchemas(metadatas);
                if (schemas) {
                    for (const key in schemas) {
                        const schema = schemas[key];
                        if (schema.required) {
                            each(schema.required, (fieldKey) => {
                                if (schema.properties && schema.properties[fieldKey]) {
                                    schema.properties[fieldKey].required = true;
                                }
                            });
                        }
                    }
                    routeOptions.schemas = schemas;
                }
            } catch (err) {
                if (!/Cannot find module 'class-validator'/.test(err.message)) {
                    throw err;
                }
            }

            const routePaths = generator.routeToSwaggerPaths(apiRoute.route, routeOptions);

            generator.mergeSwaggerPaths(doc.paths, routePaths, options);
        }, this);

        return doc;
    }
}

module.exports = SwaggerAPI;
