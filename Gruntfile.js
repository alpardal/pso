module.exports = function(grunt) {
    grunt.initConfig({
        browserify: {
            dist: {
                options: {
                    transform: [
                        ['babelify', {
                            loose: 'all'
                        }]
                    ],
                    browserifyOptions: {
                        debug: true
                    }
                },
                files: {
                    './public/javascripts/app.js': ['./app/*.js']
                }
            }
        },
        watch: {
            scripts: {
                files: ['./app/*.js'],
                tasks: ['browserify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['browserify']);
};
