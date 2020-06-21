const express = require("express")
const server = express()

// pegar banco de dados
const db = require("./database/db")


// configurar pasta pública
server.use(express.static("public"))

// habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({
    extended: true
}))

// utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})


// configurar caminhos da minha aplicação
//página inicial
// req => requisição
// res => resposta
server.get("/", function (req, res) {
    return res.render("index.html")
})

server.get("/create-point", function (req, res) {

    console.log(req.query)

    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {

    // inserir dados no banco de dados
    const query = `    
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `
    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if (err) {
            console.log(err)
            return res.render("create-point.html", {
                erro: true
            })
        }
        console.log("Cadastrado com sucesso")
        console.log(this)
        return res.render("create-point.html", {
            saved: true
        })
    }

    db.run(query, values, afterInsertData)



})

server.get("/search", function (req, res) {

    const search = req.query.search
    if (search == "") {
        // pesquisa vazia
        return res.render("search-results.html", {
            total: 0
        })
    }

    // pegar arquivos do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
        if (err) {
            return console.log(err)
        }

        const total = rows.length

        // mostrar a pag html com os dados do banco de dados
        return res.render("search-results.html", {
            places: rows,
            total
        })
    })


})

// ligar o servidor
server.listen(3000)