const express = require("express")
const cors = require("cors")
const app = express()
const PORT = 8080
const fs = require("fs")

app.use(cors())
app.use(express.json())
app.use(express.static("data"))

app.listen(
    process.env.PORT || PORT,
    () => console.log("Server running on port 8080..")
)

const usersPath = __dirname + "/data/users.json"
const tablesPath = __dirname + "/data/tables.json"
const historyPath = __dirname + "/data/tablesHistory.json"

const filterAndSortData = (data, query, possibleFilterProps) => {
    //filter
    possibleFilterProps.forEach(pfp => {
        if (query[pfp]) {
            data = data.filter(element => element[pfp] == query[pfp])
        }
    })
    //sort
    const order = query._order
    const sortBy = query._sort
    if (order === "ASC") data.sort((a, b) => parseFloat(a[sortBy]) - parseFloat(b[sortBy]))
    else if (order === "DESC") data.sort((a, b) => parseFloat(b[sortBy]) - parseFloat(a[sortBy]))

    return data
}

//**************************************USERS******************************************
app.route("/users")
    .get((req, res) => {
        let data = require(usersPath)
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', data.length)
        data = filterAndSortData(data, req.query, ["name", "id"])
        res.status(200).json(data)
    })
    .post((req, res) => {
        try {
            const data = require(usersPath)
            const newUser = req.body
            newUser.id = newId(data)
            data.push(newUser)
            fs.writeFile(usersPath, JSON.stringify(data), error => {if (error) console.log(error)})
            res.status(200).send("Usuario ingresado correctamente")
        } catch (error) {
            res.status(500).send("Error")
        }
    })

app.route("/users/:id")
    .get((req,res) => {
        const data = require(usersPath)
        const user = data.find(user => user.id == req.params.id)
        if (user) {
            res.status(200).json(user)
        } else {
            res.status(400).send("Usuario no encontrado")
        }

    })
    .put((req, res) => {
        const data = require(usersPath)
        const user = data.find(user => user.id == req.params.id)
        if (user) {
            try {
                const userUpdate = req.body
                let updated = false
                if (userUpdate.name) {
                    user.name = userUpdate.name
                    updated = true
                }

                if (updated) {
                    res.status(200).json(user)
                    fs.writeFile(usersPath, JSON.stringify(data), error => {if (error) console.log(error)})
                }
                else res.status(400).send("No hay campos actualizables")
            } catch (error) {
                res.status(500).send(error)
            }
            
        } else {
            res.status(400).send("Usuario no encontrado")
        }
    })
    .delete((req,res) => {
        const data = require(usersPath)
        const userIndex = data.findIndex(user => user.id == req.params.id)
        if (userIndex !== -1) {
            data.splice(userIndex, 1)
            res.status(200).send("Usuario eliminado")
            fs.writeFile(usersPath, JSON.stringify(data), error => {if (error) console.log(error)})
        } else {
            res.status(400).send("Usuario no encontrado")
        }

    })

//**************************************TABLES******************************************

app.route("/tables")
    .get((req, res) => {
        let data = require(tablesPath)
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', data.length)
        data = filterAndSortData(data, req.query, ["id", "capacity"])
        res.status(200).json(data)
    })
    .post((req, res) => {
        try {
            const data = require(tablesPath)
            const newTable = req.body
            newTable.id = newId(data)
            data.push(newTable)
            fs.writeFile(tablesPath, JSON.stringify(data), error => {if (error) console.log(error)})
            res.status(200).send("Mesa ingresada correctamente")
        } catch (error) {
            res.status(500).send("Error")
        }
    })

app.route("/tables/:id")
    .get((req,res) => {
        const data = require(tablesPath)
        const table = data.find(table => table.id == req.params.id)
        if (table) {
            res.status(200).json(table)
        } else {
            res.status(400).send("Mesa no encontrada")
        }

    })
    .put((req, res) => {
        const data = require(tablesPath)
        const table = data.find(table => table.id == req.params.id)
        if (table) {
            try {
                const tableUpdate = req.body
                let updated = false
                if (tableUpdate.id) {
                    table.number = tableUpdate.id
                    updated = true
                }
                if (tableUpdate.capacity) {
                    table.capacity = tableUpdate.capacity
                    updated = true
                }
                if (tableUpdate.position) {
                    table.position = tableUpdate.position
                    updated = true
                }

                if (updated) {
                    res.status(200).json(table)
                    fs.writeFile(tablesPath, JSON.stringify(data), error => {if (error) console.log(error)})
                }
                else res.status(400).send("No hay campos actualizables")
            } catch (error) {
                res.status(500).send(error)
            }
            
        } else {
            res.status(400).send("Usuario no encontrado")
        }
    })
    .delete((req,res) => {
        const data = require(tablesPath)
        const tableIndex = data.findIndex(table => table.id == req.params.id)
        if (tableIndex !== -1) {
            data.splice(tableIndex, 1)
            res.status(200).send("Tabla eliminada")
            fs.writeFile(tablesPath, JSON.stringify(data), error => {if (error) console.log(error)})
        } else {
            res.status(400).send("Tabla no encontrada")
        }

    })


//**************************************TABLESHISTORY******************************************

app.route("/history")
    .get((req, res) => {
        let data = require(historyPath)
        res.set('Access-Control-Expose-Headers', 'X-Total-Count')
        res.set('X-Total-Count', data.length)
        data = filterAndSortData(data, req.query, ["id", "table_id", "user_id", "state", "payed"])
        res.status(200).json(data)
    })
    .post((req, res) => {
        try {
            const data = require(historyPath)
            const newTable = req.body
            newTable.id = newId(data)
            data.push(newTable)
            fs.writeFile(historyPath, JSON.stringify(data), error => {if (error) console.log(error)})
            res.status(200).json(newTable)
        } catch (error) {
            res.status(500).send("Error")
        }
    })

app.route("/history/:id")
    .get((req,res) => {
        const data = require(historyPath)
        const historyEvent = data.find(he => he.id == req.params.id)
        if (historyEvent) {
            res.status(200).json(historyEvent)
        } else {
            res.status(400).send("Tabla no encontrada")
        }

    })
    .put((req, res) => {
        const data = require(historyPath)
        const historyEvent = data.find(he => he.id == req.params.id)
        if (historyEvent) {
            try {
                const heUpdate = req.body
                let updated = false
                if (heUpdate.id) {
                    historyEvent.id = heUpdate.id
                    updated = true
                }
                if (heUpdate.table_id) {
                    historyEvent.table_id = heUpdate.table_id
                    updated = true
                }
                if (heUpdate.user_id) {
                    historyEvent.user_id = heUpdate.user_id
                    updated = true
                }
                if (heUpdate.state) {
                    historyEvent.state = heUpdate.state
                    updated = true
                }
                if (heUpdate.payed) {
                    historyEvent.payed = heUpdate.payed
                    updated = true
                }
                if (heUpdate.date) {
                    historyEvent.date = heUpdate.date
                    updated = true
                }

                if (updated) {
                    res.status(200).json(historyEvent)
                    fs.writeFile(historyPath, JSON.stringify(data), error => {if (error) console.log(error)})
                }
                else res.status(400).send("No hay campos actualizables")
            } catch (error) {
                res.status(500).send(error)
            }
            
        } else {
            res.status(400).send("Evento no encontrado")
        }
    })
    .delete((req,res) => {
        const data = require(historyPath)
        const eventIndex = data.findIndex(he => he.id == req.params.id)
        if (eventIndex !== -1) {
            data.splice(eventIndex, 1)
            res.status(200).send("Evento eliminado")
            fs.writeFile(historyPath, JSON.stringify(data), error => {if (error) console.log(error)})
        } else {
            res.status(400).send("Evento no encontrado")
        }

    })


//********************************************************************************


function newId(jsonArray) {
    let max = 0
    jsonArray.forEach(el => {
        if (el.id > max) max = el.id
    })
    return max + 1
}