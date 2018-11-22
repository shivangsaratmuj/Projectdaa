var originalText = 'original';
var compressedText = 'compressed';

// Code for reading HTML from website, courtesy of http://james.padolsey.com/javascript/cross-domain-requests-with-jquery/

jQuery.ajax = (function (_ajax) {
    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        YQL = 'http' + (/^https/.test(protocol) ? 's' : '') + '://query.yahooapis.com/v1/public/yql?callback=?',
        query = 'select * from html where url="{URL}" and xpath="*"';
    function isExternal(url) {
        return !exRegex.test(url) && /:\/\//.test(url);
    }
    return function (o) {
        var url = o.url;
        if (/get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url)) {
            // Manipulate options so that JSONP-x request is made to YQL
            o.url = YQL;
            o.dataType = 'json';
            o.data = {
                q: query.replace(
                    '{URL}',
                    url + (o.data ?
                        (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data)
                        : '')
                ),
                format: 'xml'
            };
            // Since it's a JSONP request
            // complete === success
            if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
            }
            o.success = (function (_success) {
                return function (data) {
                    if (_success) {
                        // Fake XHR callback.
                        _success.call(this, {
                            responseText: (data.results[0] || '')
                                // YQL screws with <script>s
                                // Get rid of them
                                .replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                        }, 'success');
                    }
                };
            })(o.success);
        }
        return _ajax.apply(this, arguments);
    };
})(jQuery.ajax);

// Code for Binary Heap, courtesy of http://eloquentjavascript.net/1st_edition/appendix2.html

function BinaryHeap(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
    push: function (element) {
        // Add the new element to the end of the array.
        this.content.push(element);
        // Allow it to bubble up.
        this.bubbleUp(this.content.length - 1);
    },

    pop: function () {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it sink down.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    },

    remove: function (node) {
        var length = this.content.length;
        // To remove a value, we must search through the array to find
        // it.
        for (var i = 0; i < length; i++) {
            if (this.content[i] != node) continue;
            // When it is found, the process seen in 'pop' is repeated
            // to fill up the hole.
            var end = this.content.pop();
            // If the element we popped was the one we needed to remove,
            // we're done.
            if (i == length - 1) break;
            // Otherwise, we replace the removed element with the popped
            // one, and allow it to float up or sink down as appropriate.
            this.content[i] = end;
            this.bubbleUp(i);
            this.sinkDown(i);
            break;
        }
    },

    size: function () {
        return this.content.length;
    },

    bubbleUp: function (n) {
        // Fetch the element that has to be moved.
        var element = this.content[n], score = this.scoreFunction(element);
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            var parentN = Math.floor((n + 1) / 2) - 1,
                parent = this.content[parentN];
            // If the parent has a lesser score, things are in order and we
            // are done.
            if (score >= this.scoreFunction(parent))
                break;

            // Otherwise, swap the parent with the current element and
            // continue.
            this.content[parentN] = element;
            this.content[n] = parent;
            n = parentN;
        }
    },

    sinkDown: function (n) {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);

        while (true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) * 2, child1N = child2N - 1;
            // This is used to store the new position of the element,
            // if any.
            var swap = null;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N],
                    child1Score = this.scoreFunction(child1);
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore)
                    swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap == null ? elemScore : child1Score))
                    swap = child2N;
            }

            // No need to swap further, we are done.
            if (swap == null) break;

            // Otherwise, swap and continue.
            this.content[n] = this.content[swap];
            this.content[swap] = element;
            n = swap;
        }
    }
};

// My Huffman Coding Algorithm

function HuffmanCoding(inputString) {
    this.inputString = inputString;

    var letterCount = {};
    // Loop through each character in the string and tally the frequency of each of the characters
    for (var i = 0; i < inputString.length; i++) {
        if (inputString[i] in letterCount) {
            letterCount[inputString[i]]++;
        } else {
            letterCount[inputString[i]] = 1;
        }
    }

    // Create a heap to contain and sort the nodes in the huffman coding tree
    var huffmanHeap = new BinaryHeap(function (x) { return x[0]; });

    // Add each of the letters and their frequencies to the heap
    for (var letter in letterCount) {
        huffmanHeap.push([letterCount[letter], letter]);
    }

    while (huffmanHeap.size() > 1) {
        // Pop 2 nodes from heap, these are the two nodes with the smallest frequencies
        var leftNode = huffmanHeap.pop();
        var rightNode = huffmanHeap.pop();

        // Push the updated subtree back onto the heap
        huffmanHeap.push([leftNode[0] + rightNode[0], [leftNode[1], rightNode[1]]]);
    }

    var huffmanTree = huffmanHeap.pop();
    this.huffmanCodes = {};
    // Assign huffman codes to each of the nodes recursively
    this.encode(huffmanTree[1], "");

    // Create compressed string according to huffman codes
    this.huffmanString = ""
    for (var i = 0; i < this.inputString.length; i++) {
        this.huffmanString += this.huffmanCodes[inputString[i]];
    }

    // ES7 specific feature (compatible with Chrome 51 w/ flag enabled)
    this.sortedCodes = Object.entries(this.huffmanCodes);
    
    // Sort huffman codes by huffman code length
    this.sortedCodes.sort(function (a, b) {
        if (a[1].length < b[1].length) {
            return -1;
        }
        if (a[1].length > b[1].length) {
            return 1;
        }
        return 0;
    });
}

// Recursive function to assign huffman codes to the nodes
HuffmanCoding.prototype.encode = function (subtree, prefix) {
    if (subtree instanceof Array) {
        // Prefix the current huffman code of each left node and left child node with a 0
        this.encode(subtree[0], prefix + "0");
        // Prefix the current huffman code of each right node and right child node with a 1
        this.encode(subtree[1], prefix + "1");
    }
    else {
        this.huffmanCodes[subtree] = prefix;
    }
}

// Uses huffman coding to get huffman codes and display in table
function getHuffmanCodes() {
    var huff = new HuffmanCoding(originalText);
    // Clear huffman encoding table
    $('#huffman-tbody').empty();
    // Display huffman encoding table
    for (var [key, value] of huff.sortedCodes) {
        $('#huffman-tbody').append('<tr><td>' + key + '</td><td>' + value + '</td></tr>');
    }

    compressedText = huff.huffmanString;
}

// Returns the byte length of an utf-8 string
function getByteLength(str) {
  var s = str.length;
  for (var i=str.length-1; i>=0; i--) {
    var code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s+=2;
    if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
  }
  return s;
}

function getCompTextColor(compValue) {
    compValue = Number(compValue)
    
    if(compValue > 70)
        return 'rgb(0,255,0)';
    else if(compValue > 50)
        return 'rgb(40,215,0)';
    else if(compValue > 30)
        return 'rgb(80,175,0)';
    else if(compValue > 10)
        return 'rgb(175,80,0)';
    else if(compValue > -10)
        return 'rgb(215,40,0)';
    else
        return 'rgb(255,0,0)'
}

// Calculates file sizes and compression percentage and displays them
function calculateCompression() {
    let originalBitCount = getByteLength(originalText) * 8;
    let compressedBitCount = compressedText.length;
    let compressionPercent = ((1 - (compressedBitCount / originalBitCount)) * 100).toFixed(2);
    $('#ogFileSize').html(originalBitCount);
    $('#comFileSize').html(compressedBitCount);
    $('#compressRatio').html(compressionPercent + '%');
    $('#compressRatio').css('color', getCompTextColor(compressionPercent));
}

// Executes algorithm when go button for website is clicked
function websiteGoClick() {
    originalText = '<plaintext>';

    let websiteUrl = $('#website-url').val();

    $.get(websiteUrl, function (response) {
        // Removes carriage return &#xd; and removes extra whitespace
        let websiteHtml = response.responseText.replace(/&#xd;/g, '').replace(/([\n\r][ \t]*){2,}/g, '\n');
        $('#render').html(websiteHtml);
        originalText += websiteHtml;
        originalText += '</plaintext>';
        getHuffmanCodes(originalText);
        calculateCompression();
        // Unhide results display
        $('#results').css('visibility', 'visible');
    });
    
    $('.modal-title').html(websiteUrl);
}

// Executes algorithm when go button for file is clicked
function fileGoClick() {
    originalText = '';

    var file = $('#inputFile')[0].files[0];

    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            originalText = evt.target.result;
            $('#render').html(originalText);
            getHuffmanCodes(originalText);
            calculateCompression();
            // Unhide results display
            $('#results').css('visibility', 'visible');
        }
        reader.onerror = function (evt) {
            alert("Error reading file");
        }
    }

    $('.modal-title').html(file['name']);
    $('#mod-date').html(file['lastModifiedDate']);
}

// Sets body text for modals
function setModalBody(key) {
    if (key === 0) {
        $('.modal-body').html(originalText);
    }
    else {
        $('.modal-body').html(compressedText);
    }
}

function resetResults() {
    $('#results').css('visibility', 'hidden');
}