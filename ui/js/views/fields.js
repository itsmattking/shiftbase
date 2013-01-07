define('views/fields', ['views/fields/string',
                        'views/fields/text',
                        'views/fields/date',
                        'views/fields/boolean',
                        'views/fields/image',
                        'views/fields/choice'],
       function(string, text, date, bool, image, choice) {

         return {
           string: string,
           text: text,
           date: date,
           boolean: bool,
           image: image,
           choice: choice
         };

       });