# Tetris solver

This is an attemps to answer the question:
Given a set of [these](http://www.amazon.co.uk/Tetris-JAN131883-Fridge-Magnets/dp/B008HFMEE0), is it possible to form a rectangle using all the pieces.

## Description

Open index.html in a browser. Enter the number of pieces of each type you have, and the solver tries to solve the problem.

## Limitation
Currently, only if you enter 1, 2 and 4 do you get an answer in a reasonable amount of time.

## Additional option
In order to test with a subset of pieces, I have added an option in the url.
The pieces are called SQR, T, SL (snake left), SR (snake right), L, NL (inverted L) and I.
index.html?pieces=SQR-I uses only the square and the I pieces.

The following subsets give more results:
tetris.html?pieces=SQR-I: even numbers, 1 and 3
tetris.html?pieces=SQR-I-L-NL: 7 and under

## Testing
Opening basicTetrisChecks.html allows you to run some basic tests.
