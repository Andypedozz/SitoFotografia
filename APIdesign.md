
Richieste Admin Dashboard:
Progetti:
* GET api/projects
* POST api/projects
    Dati inviati:
    {
        nome: "",
        descrizione: "",
        anno: "",
        copertina: ""
    }

* PUT api/projects
    {
        nome: "",
        descrizione: "",
        anno: "",
        copertina: ""
    }

* DELETE api/projects
    {
        nome: "" / id: ""
    }


Media:
* GET api/media
* POST api/media
    {
        nome: "",
        percorso: "",
        idProgetto: ""
    }
* PUT api/media
    {
        nome: "",
        percorso: "",
        idProgetto: ""
    }
* DELETE api/media
    {
        nome: "" / id: ""
    }

Richieste lato public:
Homepage:
GET api/projects/homepage
SELECT * FROM Progetto WHERE Homepage = 1

Progetti:
GET api/projects?limit=10
SELECT * FROM Progetto LIMIT 10

Singolo progetto:
GET api/media?projectId=id
SELECT * FROM Media WHERE idProgetto = ?
