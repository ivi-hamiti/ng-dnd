module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            dndFiles: ['src/*.js']
        },
        uglify: {
            all_src: {
                options: {
                    preserveComments: 'some'
                },
                files: {
                    'examples/angular-dnd.min.js': [
                        'src/dndMod.js',
                        'src/dndData.js',
                        'src/dndDraggable.js',
                        'src/dndDroppable.js'
                    ],
                    'examples/angular-dnd-touch.min.js': [
                        'lib/ios-drag-drop.js'
                    ]
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8080,
                    base: './examples',
                    open: true,
                    hostname: '*',
                    keepalive: true
                }
            }
        },
        concat: {
            options: {
                banner: '(function () {\r\n\r\n',
                footer: '\r\n\r\n})();',
                separator: '\r\n\r\n',
                process: function (src, filepath) {
                    return src
                        .replace(/^/g, "\t")
                        .replace(/\r\n/g, "\r\n\t");
                }
            },
            ngDnd: {
                src: [
                    'src/dndMod.js',
                    'src/dndData.js',
                    'src/dndDraggable.js',
                    'src/dndDroppable.js'
                ],
                dest: 'examples/angular-dnd.js'
            },
            ngDndTouch: {
                src: ['lib/ios-drag-drop.js'],
                dest: 'examples/angular-dnd-touch.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'concat', 'jshint']);
    grunt.registerTask('serve', ['uglify', 'concat', 'connect']);
};
