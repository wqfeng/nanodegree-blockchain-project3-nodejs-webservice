const SHA256 = require('crypto-js/sha256');
const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.myBlockChain = new BlockChain.Blockchain();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        let self = this;
        this.app.get("/block/:index", (req, res) => {
            let index = req.params.index
            console.log("Getting block for index: " + index)

            // this serves as an optimization as we dont even
            // query the DB if index of the block to GET is -ve.
            if(index < 0) {
                res.send("Invalid block height. Cannot be negative")
            } else {
                self.myBlockChain.getBlockHeight().then((height) => {
                    console.log("height of the chain: " + height);
                    if(index > height) {
                        res.send("Invalid block height")
                    } else {
                        self.myBlockChain.getBlock(index).then((block) => {
                            let blockJson = JSON.parse(block);
                            res.status(200).send(blockJson)
                        }).catch((err) => {
                            console.log(err);
                        });
                    }
                }).catch((err) => {
                    console.log(err);
                    if (err.notFound) {
                        res.status(404).send(err)
                    } else {
                        res.status(400).send(err)
                    }
                });
            }
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        let self = this
        self.app.post("/block", (req, res) => {
            let block = req.body
            console.log("req.body: " + JSON.stringify(block))

            if (typeof block.body === 'undefined'
                || !block.body || block.body === "") {
                res.send("No data for block. block.body: " + block.body)
            } else {
                self.myBlockChain.addBlock(block).then((result) => {
                    res.status(201).send(result);
                });
            }
        });
    }

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}