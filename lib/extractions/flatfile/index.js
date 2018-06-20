'use strict';
const fs = require('fs');
const path = require('path');

async function FLATFILE() {
    const options = this;
    const skipItems = options.skipHeaderRows || 0;
    const LF = 10;
    const CR = 13;
    var bufferSize = options.bufferSize || 64 * 1024;
    var position = options.startFrom || 0;
    var lines;
    var currentLine = -1;

    // Open the file to be extracted
    var fd;
    var fileStats;
    var filesize;
    var filepath;
    try {
        // Try absolute path
        try {
            filepath = path.normalize(options.path)
            fd = fs.openSync(filepath, 'r');
        } catch (error) {
            // Try relative path
            try {
                filepath = path.normalize(path.join(__dirname, options.path));
                fd = fs.openSync(filepath, 'r');
            } catch (error) {
                throw new Error("File at " + options.path + " cannot be found. Please check your configuration");
            };
        };
        fileStats = fs.fstatSync(fd);
        filesize = fileStats.size;
    } catch (error) {
        throw new Error(error.message);
    };

    /* PRIVATE method */
    function* _readLines() {
        var lineBuffer;
        while (position < filesize) {
            let remaining = filesize - position;
            if (remaining < bufferSize) bufferSize = remaining;
            let chunk = Buffer.alloc(bufferSize);
            let bytesRead = fs.readSync(fd, chunk, 0, bufferSize, position);
            let curpos = 0;
            let startpos = 0;
            let lastbyte = null;
            let curbyte;
            while (curpos < bytesRead) {
                curbyte = chunk[curpos];
                if (curbyte === LF && lastbyte !== CR || curbyte === CR && curpos < bytesRead - 1) {
                    yield _concat(lineBuffer, chunk.slice(startpos, curpos));
                    lineBuffer = undefined;
                    startpos = curpos + 1;
                    if (curbyte === CR && chunk[curpos + 1] === LF) {
                        startpos++;
                        curpos++;
                    };
                } else if (curbyte === CR && curpos >= bytesRead - 1) {
                    lastbyte = curbyte;
                };
                curpos++;
            };
            position += bytesRead;
            if (startpos < bytesRead) {
                lineBuffer = _concat(lineBuffer, chunk.slice(startpos, bytesRead));
            };
        };
        // dump what ever is left in the buffer
        if (Buffer.isBuffer(lineBuffer)) yield lineBuffer;
    };

    /* PRIVATE method */
    function _concat(buffOne, buffTwo) {
        if (!buffOne) return buffTwo;
        if (!buffTwo) return buffOne;

        let newLength = buffOne.length + buffTwo.length;
        return Buffer.concat([buffOne, buffTwo], newLength);
    };

    /* PUBLIC method */
    function invoke() {
        try {
            var nextLine = lines.next();
            currentLine++;
            while (currentLine <= skipItems - 1) {
                nextLine = lines.next();
                currentLine++;
            };
            if (!nextLine.done) {
                nextLine.value = nextLine.value.toString();
            };
            return nextLine;
        } catch (error) {
            throw error;
        };
    };

    return new Promise((resolve, reject) => {
        setImmediate(() => {
            try {
                lines = _readLines();
                return resolve({ invoke });
            } catch (error) {
                return reject(new Error("Unable to load transformation module"));
            };
        });
    });
};

module.exports = {
    name: "FLATFILE",
    exe: FLATFILE
};