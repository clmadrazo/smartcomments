var DefaultTemplate = {

    initialize: function(config) {
        DefaultTemplate.config = config;
    },

    executeWalk: function(walkname, params) {
        var instance = DefaultTemplate,
            tags;

        //para cada tag ejecuta el walkname
        Object.keys(instance.tags).forEach(function(item, index) {
            if (instance.tags[item][walkname] && instance.config.tags[item]) {
                instance.tags[item][walkname](params);
            }
        });
    },

    getCommentsList: function() {
        var instance = DefaultTemplate;
        return instance.comments_list;
    },

    setCommentsList: function(list) {
        var instance = DefaultTemplate;
        instance.comments_list = list;
    },

    //ATTRS
    tags: {
        //Every tag it's implementation are defined here
        function: {
            buildComment: function(data) {
                var instance = DefaultTemplate,
                    config = instance.config,
                    available_options = config.tags.

                    function,
                    pos,
                    comment = {
                        pos: data.pos,
                        tags: []
                    },
                    method_name = data.name,
                    node = data.node,
                    params = [],
                    default_value = 'My function Description';

                if (available_options.desc) {
                    if (available_options.desc.value) {
                        default_value = available_options.desc.value;
                    }
                    //TODO: El valor de este tag deberia ser vacio
                    comment.tags.push({
                        name: '',
                        value: default_value
                    });
                }


                if (method_name && available_options.name) {
                    comment.tags.push({
                        name: '@method',
                        value: method_name
                    });
                }

                //parametros
                if (available_options.params) {
                    //console.log('available_options.params');
                    var array = node.params,
                        size = array.length,
                        i = 0,
                        value;
                    for (i; i < size; i++) {
                        params.push({
                            name: array[i].name,
                            type: array[i].type
                        });
                        value = '{} ' + array[i].name;
                        comment.tags.push({
                            name: '@param',
                            value: value
                        });
                    };
                }

                //return statement
                if (available_options.params) {
                    var body_elements = node.body.body;

                    if (body_elements) {
                        var size = body_elements.length,
                            value = '';
                        i = 0;
                        for (var i = 0; i < size; i++) {
                            if (body_elements[i].type === 'ReturnStatement') {
                                if (body_elements[i].argument) {
                                    if (body_elements[i].argument.name) {
                                        value = body_elements[i].argument.name;
                                    } else {
                                        value = body_elements[i].argument.type;
                                    }

                                }
                            }
                        };

                        comment.tags.push({
                            name: '@return',
                            value: value
                        });
                    }

                }



                if (comment.pos >= 0) {
                    instance.comments_list.push(comment);
                }
            },

            //concrete walkImplementations for functions tags in default Template
            //params node, parent, fieldName, siblings, index
            enterFunctionExpression: function(params) {
                var instance = this,
                    comment_data = {},
                    parent = params.parent;

                //si es de tipo property
                if (parent.type === 'Property') {

                    if (parent.key) {
                        comment_data.name = parent.key.name;
                    }

                    comment_data.pos = parent.range[0];
                    comment_data.node = params.node;
                    instance.buildComment(comment_data);
                }
            },

            enterFunctionDeclaration: function(params) {
                var instance = this,
                    node = params.node,
                    comment_data = {
                        pos: node.range[0],
                        name: node.id.name,
                        node: node
                    };
                instance.buildComment(comment_data);
            },

            enterVariableDeclaration: function(params) {
                var instance = this,
                    node = params.node,
                    declarations = node.declarations,
                    size = declarations.length,
                    i = 0,
                    item,
                    comment_data = {};

                for (i; i < size; i++) {
                    item = declarations[i];
                    if (item.init && item.init.type === 'FunctionExpression') {
                        comment_data.name = item.id.name;
                        comment_data.node = item.init;
                    }

                };

                if (comment_data.name) {
                    comment_data.pos = node.range[0];
                    instance.buildComment(comment_data);
                }
            }


        }
    },

    comments_list: [],
    config: {}
}

module.exports = {
    executeWalk: DefaultTemplate.executeWalk,
    initialize: DefaultTemplate.initialize,
    getCommentsList: DefaultTemplate.getCommentsList,
    setCommentsList: DefaultTemplate.setCommentsList
};
