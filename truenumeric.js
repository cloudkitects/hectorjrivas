        $("#ODSizesA").on("keydown", function () {
            // Backspace   => 8
            // TAB         => 9
            // Shift       => 16
            // Ctrl        => 17
            // Alt         => 18
            // Caps lock   => 20
            // End         => 35
            // Home        => 36
            // Left arrow  => 37
            // Up arrow    => 38
            // Right arrow => 39
            // Down arrow  => 40
            // Insert      => 45
            // Number lock => 144
            // AltGr key   => 225
            var navigationKeys = [8, 9, 16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

            if ($.inArray(event.which, navigationKeys) !== -1) {
                // unfortunately, if we use the backspace key to delete the dot, it can be repeated...
                return;
            }
            // dot--prevent a second one
            var dot = (this.value.match(/\./g) || []).length;

            if ((event.which === 110 || event.which === 190) && dot) {
                return false;
            }

            // plus sign--no op
            if (event.which === 107 || event.which === 187) {
                return false;
            }

            // minus sign--change sign like a calculator would
            if ((event.which === 109 || event.which === 189)) {

                if (this.value.charAt(0) === '-') {
                    this.value = this.value.substring(1);
                }
                else {
                    this.value ='-' +  this.value;
                }

                return false;
            }

            // limit the scale to 4 digits
            if (dot && this.value.substring(this.value.indexOf('.')).length > 4)
                return false;
        });