This his is hacked together code only meant to showcase how fast and easy it is to create algorand enabled clicker game with only basic web stack used (vanilla javascript + html + css)

PLAY DEMO HERE: https://algo-clicker.vercel.app/

req:
npm init -y 
webpack-cli --save-dev

build:
npx webpack
//because running everything on client is fun

run:
index.html

Rationale:
- games are fun
- games are complex to build
- adding web3 elements is oftentimes uneccessarily complex
- communities can benefit from a copy/paste template game that they can easily share across different platforms
- for giveaways/competitions the prize wallet can be topped up with extra tokens for additional prize
(by default it is funded only by participants entry fees)

Pros:
- all logic happens on client (can be hosted as static webpage)
- easy to embed
- you can save the webpage on your mobile device as app, directly from the browser

How to play?

- to participate you need to fund the hotwallet with 0.2A 
- (click connect wallet then click new attempt)
- do the clicker game, for each tap it will spam txns to algorand nework to prize address on your behalf
- when game finishes hot wallet will auto close reminder to escrow (everyone pays same price of admision)
- bigger score = better cahnce of winning
- thats it :D
- all algos from teh prize wallet get sent to random winner (winner is the wallet from which you funded your hotwallet) monthly*




