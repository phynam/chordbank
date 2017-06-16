(function() {

    var _chord_patterns = [
        {
            type: 'M',
            recipe: ['3', '5']
        },
        {
            type: 'm',
            recipe: ['b3', '5']
        },
        {
            type: 'dim',
            recipe: ['b3', 'bb5']
        },
        {
            type: 'aug',
            recipe: ['3', '##5']
        },
        {
            type: 'dim7',
            recipe: ['b3', 'bb5', 'bb7']
        },
        {
            type: 'm7b5',
            recipe: ['b3', 'bb5', 'b7']
        },
        {
            type: 'm7',
            recipe: ['b3', '5', 'b7']
        },
        {
            type: 'mM7',
            recipe: ['b3', '5', '7']
        },
        {
            type: '7',
            recipe: ['3', '5', 'b7']
        },
        {
            type: 'M7',
            recipe: ['3', '5', '7']
        },
        {
            type: 'aug7',
            recipe: ['3', '##5', 'b7']
        },
        {
            type: 'augM7',
            recipe: ['3', '##5', 'b7']
        }
    ];

    var ChordBank = function(attrs) {

        var _message_prefix = '[ChordBank]';
        var _library;
        var _notes;

        /**
         * Send a console notification
         *
         * @param type
         * @param message
         * @private
         */
        var _notify = function(type, message) {
            if(type == 'error' || type == 'log' || type == 'warn') {
                console[type](_message_prefix + ' ' + message);
            }
        }

        /**
         * Validate a set of parameters against certain rules, returns boolean.
         * Executes callback if valid
         *
         * @param validations
         * @param parameters
         * @param callback
         * @returns {boolean}
         * @private
         */
        function _validate_parameters(validations, parameters, callback) {

            var required_fields = validations.requires,
                valid = true;

            if(required_fields) {
                var missing_fields = [];
                for(var i = 0; i < required_fields.length; i++) {
                    if(!parameters[required_fields[i]]) {
                        missing_fields.push(required_fields[i]);
                    }
                }
                if(missing_fields.length) {
                    _notify('warn', 'The following fields are required: ' + missing_fields.join(', '));
                    valid = false;
                }
            }

            if(callback && valid) {
                return callback(parameters);
            }

            return valid;
        }


        var Notes = function() {

            var _notes = [
                { name: 'C', semitones: 0 },
                { name: 'C#', semitones: 1 },
                { name: 'Db', semitones: 1 },
                { name: 'D', semitones: 2 },
                { name: 'D#', semitones: 3 },
                { name: 'Eb', semitones: 3 },
                { name: 'E', semitones: 4 },
                { name: 'F', semitones: 5 },
                { name: 'F#', semitones: 6 },
                { name: 'Gb', semitones: 6 },
                { name: 'G', semitones: 7 },
                { name: 'G#', semitones: 8 },
                { name: 'Ab', semitones: 8 },
                { name: 'A', semitones: 9 },
                { name: 'A#', semitones: 10 },
                { name: 'Bb', semitones: 10 },
                { name: 'B', semitones: 11 }
            ];

            /**
             * Validate a given note string and either return false, or execute callback
             *
             * @param note
             * @param callback
             */
            this.validate_note = function(note, callback) {

                var natural = note.charAt(0).toUpperCase(),
                    accidental = note.charAt(1) || undefined,
                    note = (accidental) ? natural + accidental : natural,
                    valid_accidentals = ['b', '#'],
                    note = this.find_by_note_name(note);

                if(note && (typeof accidental == 'undefined' || valid_accidentals.indexOf(accidental) !== -1 )) {
                    if(callback){ callback(note, accidental)};
                    return { note: note, accidental: accidental };
                } else {
                    _notify('warn', 'Invalid note entered');
                    return false;
                }
            }

            this.find_by_semitones = function(semitones, enharmonic_type) {
                var result = [];
                for (var i = 0; i < _notes.length; i++ ) {
                    if (_notes[i].semitones == semitones) {
                        if(!enharmonic_type || _notes[i].name.length == 1 || (enharmonic_type && _notes[i].name.indexOf(enharmonic_type) !== -1)) {
                            result.push(_notes[i])
                        }
                    }
                }
                return result[0];
            }

            this.find_by_note_name = function(note) {
                for (var i = 0; i < _notes.length; i++ ) {
                    if (_notes[i].name == note) {
                        return _notes[i];
                        break;
                    }
                }
            }
        }

        /**
         * Return notes at given intervals
         *
         * @private
         */
        var IntervalCalculator = function() {

            var _intervals = {
                1: { type: 'perfect', semitones: 0 },
                2: { type: 'major', semitones: 2 },
                3: { type: 'major', semitones: 4 },
                4: { type: 'perfect', semitones: 5 },
                5: { type: 'perfect', semitones: 7 },
                6: { type: 'major', semitones: 9 },
                7: { type: 'major', semitones: 11 },
                8: { type: 'perfect', semitones: 12 },
                9: { type: 'major', semitones: 2 },
                10: { type: 'major', semitones: 4 },
                11: { type: 'perfect', semitones: 5 },
                12: { type: 'perfect', semitones: 7 },
                13: { type: 'perfect', semitones: 9 }
            }

            var _alterations = {
                '#': 1, 'b': -1, '##': 2, 'bb': -2
            }

            function _parse_interval(interval_string, callback) {

                var interval = interval_string.match(/\d/g),
                    alteration_name,
                    alteration_value = 0;

                for(var key in _alterations) {
                    if(_alterations.hasOwnProperty(key) && interval_string.indexOf(key) !== -1) {
                        alteration_name = key;
                        alteration_value = _alterations[key];
                    }
                }

                if(interval && _intervals[interval.join('')]) {

                    interval = interval.join('');
                    if(callback) {
                        return callback(parseInt(interval), alteration_name, alteration_value);
                    }
                    return interval;
                } else {
                    _notify('warn', 'Interval ' + interval_string + ' not valid');
                    return false;
                }
            }

            /**
             * Return note at a particular interval
             *
             * @param root
             * @param interval
             */
            this.note_at_interval = function(root, interval) {

                var note = _notes.validate_note(root); //, function(note, accidental) {

                if(note) {
                    var note_object = _parse_interval(interval, function(interval, alteration_name, alteration_value) {

                        var int = _intervals[interval],
                            root_note = _notes.find_by_note_name(note.note.name),
                            augmented_interval,
                            enharmonic_type = (alteration_name) ? alteration_name.charAt(0) : alteration_name;
                        if(!enharmonic_type) {
                            enharmonic_type = note.accidental;
                        }

                        if (int.type == 'perfect') {
                            if (alteration_name == '##') {
                                alteration_value --;
                            } else if (alteration_name == 'bb') {
                                alteration_value ++;
                            }
                        }

                        augmented_interval = int.semitones + alteration_value;
                        var total_interval = augmented_interval + root_note.semitones;

                        calculated_interval = (total_interval < 12) ? total_interval : total_interval - 12;

                        return _notes.find_by_semitones(calculated_interval, enharmonic_type);
                    });
                }

                return note_object || false;
            }
        }

        /**
         * Chord model constructor, responsible for housing chord data and turning a pattern into notes
         *
         * @param notes
         * @param type
         * @constructor
         */
        var Chord = function(root, pattern, type) {

            this.root = root;
            this.type = type;
            this.pattern = pattern;
            this.notes = [];

            var _calculator;

            function _initialize() {
                _calculator = new IntervalCalculator();
            }

            var _notes_from_pattern = function(root, pattern) {

                if(root && pattern) {
                    var notes = [];
                    notes.push(root);

                    for(var i = 0; i < pattern.length; i++) {
                        var note = _calculator.note_at_interval(root, pattern[i]);
                        notes.push(note.name);
                    }

                    return notes;
                }
            }

            // Move below to prototype
            this.transpose = function(args) {

                var that = this;

                _validate_parameters({
                    requires: ['direction', 'semitones']
                }, args, function(parameters) {

                    that.root = _calculator.note_at_interval(that.root, '2').name;
                    that.notes = _notes_from_pattern(that.root, that.pattern);

                });
                // var new_root = _calculator.note_at_interval(root, );
                //
                // for(var i = 0; i < pattern.length; i++) {
                //     var note = _calculator.note_at_interval(root, pattern[i]);
                //     notes.push(note.name);
                // }
            }

            this.set_notes_from_pattern = function(pattern) {
                this.notes = _notes_from_pattern(this.root, pattern);
                return this;
            }

            _initialize();
        }

        /**
         * Pattern library model constructor
         *
         * @private
         */
        var PatternLibrary = function() {

            var _patterns = [];

            function _initialize() {
                for(var i = 0; i < _chord_patterns.length; i++) {
                    _patterns.push(_chord_patterns[i]);
                }
            }

            /**
             * Iterate over library and return first item matching callback expression
             * @param callback
             */
            this.find = function(callback) {
                for(var i = 0; i < _patterns.length; i++) {
                    if(callback(_patterns[i])) {
                        return _patterns[i];
                    }
                }
                _notify('warn', 'No matching chord patterns found');
            }

            _initialize();
        }

        function _initialize() {
            _library = new PatternLibrary();
            _notes = new Notes();
        }

        /**
         * Create a new chord object with given parameters
         *
         * @param parameters
         */
        this.create = function(parameters) {

            return _validate_parameters({
                requires: ['root', 'type']
            }, parameters, function(args) {

                var pattern = _library.find(function(chord) {
                    return chord.type === args.type;
                });

                if(pattern) {
                    var chord = new Chord(args.root, pattern.recipe, pattern.type);
                    return chord.set_notes_from_pattern(pattern.recipe);
                }
            });
        };

        _initialize();
    }

    window.ChordBank = window.ChordBank || ChordBank;
})();