# 🧭 Refonte Kanban – Charte d’architecture et guide Copilot

## 1. 🎯 Vision et objectifs

Cette refonte vise à rendre le module **Kanban** :
- **Lisible, maintenable et structuré** selon un modèle **MVC** clair.
- **Compréhensible pour un développeur débutant**, même sans framework.
- **Proche de l’esprit Laravel** : code expressif, explicite, sans magie ni injection cachée.
- **Fiable pour Copilot** : il doit générer du code cohérent, homogène et bien typé.

Chaque fichier doit avoir **une seule responsabilité claire**, avec une logique prévisible et un style cohérent.

---

## 2. 🧩 Structure du projet

Organisation recommandée :

```
resources/js/kanban/
├── index.js                # Point d'entrée principal
├── KanbanApplication.js    # Bootstrap de l’application
├── KanbanView.js           # Vue principale (DOM rendering)
├── controllers/            # Coordination entre modèle et vue
├── models/                 # Entités (Ticket, Column, etc.)
├── services/               # Logique métier (Import, Filter, etc.)
├── storage/                # Gestion de la persistance (local/mémoire)
├── utils/                  # Fonctions utilitaires simples
└── types/                  # Déclarations de types et contrats
```

### Règles générales :
| Dossier | Rôle |
|----------|------|
| **models/** | Données et comportements métiers purs. Pas de DOM. |
| **controllers/** | Logique d’application, coordination Model ↔ View. |
| **views/** | Gestion du DOM, événements utilisateurs. |
| **services/** | Logique réutilisable (filtres, import/export, etc.). |
| **storage/** | Stockage, sérialisation, lecture/écriture. |
| **utils/** | Helpers purs et stateless. |
| **types/** | Déclarations d’interfaces implicites. |

---

## 3. ⚙️ Principes MVC

### 🧱 Model
- Une classe = une entité métier.  
- Contient les **données** et les **méthodes de manipulation** de ces données.
- Jamais d’accès au DOM, ni à un service externe directement.

**Exemple :**
```js
/**
 * Représente un ticket du Kanban.
 */

/**
* @class Ticket
 * @property {number} id - Identifiant unique du ticket.
 * @property {string} title - Titre du ticket.
 * @property {string} description - Description détaillée du ticket.
 * @property {string} status - Statut actuel (todo, in-progress, done).
 * ...
 */

export class Ticket {
    constructor({ id, title, description, status }) {
        this.id = id;
        this.title = title;
        this.description = description || '';
        this.status = status || 'todo';
    }

    setStatus(status) {
        this.status = status;
    }
}
```

---

### 🎨 View
- Responsable **du rendu et des interactions DOM**.  
- Aucune logique métier, aucune donnée métier stockée.  
- Doit appeler les contrôleurs pour toute action.  
- Utiliser des attributs `data-*` plutôt que des `id` arbitraires.

**Exemple :**
```js
/**
 * Vue principale du Kanban.
 * @property {HTMLElement} root - Élément racine du Kanban.
 * ...  
 */
export class KanbanView {
    constructor(rootElement) {
        this.root = rootElement;
    }

    renderBoard(columns) {
        this.root.innerHTML = '';
        for (const column of columns) {
            this.root.appendChild(column.render());
        }
    }

    displayError(message) {
        alert(message);
    }
}
```

---

### 🧠 Controller
- Point de jonction entre **Models** et **View**.  
- Contient la logique de coordination (création, déplacement, filtrage, etc.).  
- Utilise les Services pour la logique métier lourde.  
- Ne manipule jamais le DOM directement (passe par la View).

**Exemple :**
```js
/**
 * Contrôleur principal du Kanban.
 */
export class KanbanController {
    constructor(view, services) {
        this.view = view;
        this.services = services;
    }

    addTicket(data) {
        const ticket = this.services.ticketService.create(data);
        const all = this.services.ticketService.getAll();
        this.view.renderBoard(all);
    }
}
```

---

## 4. 💅 Style guide JavaScript (inspiré Laravel)

### Syntaxe
- Code **propre, aligné et espacé** (lisible avant tout).
- **Pas de fonctions fléchées** dans les classes sauf nécessité. Privilégier des méthodes classiques.
- **Imports groupés et triés** (Models → Services → Utils).
- Toujours **documenter les classes et méthodes** via JSDoc clair.
- Définir les propriétés de la classe avec JSDoc de type strict.

**Structure d’un fichier standard :**
```js
// 1. Imports
import { Ticket } from '../models/Ticket.js';

// 2. Constantes locales
const DEFAULT_STATUS = 'todo';

/**
    @ class TicketService
    @ description Service pour gérer les tickets du Kanban.
    @property {Ticket[]} tickets - Liste des tickets.
 */
export class TicketService {
    constructor() {
        this.tickets = [];
    }

    /**
     * Crée un nouveau ticket.
     * @param {{title: string, description?: string}} data
     * @returns {Ticket}
     */
    create(data) {
        const ticket = new Ticket({
            id: Date.now(),
            title: data.title,
            description: data.description || '',
            status: DEFAULT_STATUS,
        });

        this.tickets.push(ticket);
        return ticket;
    }

    /**
     * Retourne tous les tickets.
     */
    getAll() {
        return this.tickets;
    }
}
```

### Convention de nommage
| Élément | Convention | Exemple |
|----------|-------------|----------|
| Classes | `PascalCase` | `TicketService`, `KanbanController` |
| Méthodes / fonctions | `camelCase` | `addTicket()`, `moveTo()` |
| Constantes | `SCREAMING_SNAKE_CASE` | `MAX_TICKET_COUNT` |
| Fichiers | nom = nom de la classe | `TicketService.js`, `KanbanView.js` |

### Organisation interne (comme Laravel)
1. Imports  
2. Constantes  
3. Classe principale  
4. Méthodes publiques  
5. Méthodes privées (`_prefix`)  
6. Export final  

---

## 5. 🚫 Anti-patterns à bannir

| Anti-pattern | Explication |
|---------------|-------------|
| ❌ Mélange Model / DOM | Le modèle ne doit **jamais** manipuler le DOM. |
| ❌ Logique “magique” | Pas de code implicite, tout doit être explicite. |
| ❌ Classes fourre-tout | Une classe = une responsabilité claire. |
| ❌ Variables globales | Toujours injecter via constructeur. |
| ❌ Copilot spaghetti | Si Copilot pond un truc bizarre → refactoriser, ne pas patcher. |
| ❌ Arrow functions abusives | Éviter la syntaxe compacte au détriment de la lisibilité. |

---

## 6. 🧩 Exemple d’architecture cohérente

```
KanbanApplication
 ├─ KanbanController
 │   ├─ TicketService
 │   ├─ FilterService
 │   └─ StorageStrategy
 ├─ KanbanView
 │   ├─ renderBoard()
 │   ├─ displayError()
 │   └─ bindEvents()
 └─ Models
     ├─ Ticket
     ├─ Column
     └─ User
```

Le `KanbanApplication` :
- Initialise les services, modèles et la vue.
- Instancie le contrôleur avec les dépendances.
- Lance le rendu initial du tableau Kanban.

---

## 7. 🤖 Prompt Copilot – à coller dans `.copilot-instructions` ou en haut des fichiers

```
When editing code inside /resources/js/kanban:
- Follow a clean MVC architecture (Model, View, Controller).
- Each class must be in its own file.
- Models handle data and business logic only (no DOM).
- Views handle DOM rendering and user events only.
- Controllers coordinate between models and views.
- Use descriptive class and method names.
- Always document classes and methods with JSDoc.
- Prefer clarity and alignment over conciseness.
- Never use global variables or implicit references.
- Avoid arrow functions in classes unless necessary.
- Keep imports clean and ordered (Models → Services → Utils).
```

---

## 8. 📘 Résumé

| Principe | Résumé |
|-----------|---------|
| **MVC clair** | Model = Données, View = DOM, Controller = Coordination |
| **Lisibilité avant tout** | Code structuré, commentaires, JSDoc |
| **Old school vibe** | Style Laravel, explicite et propre |
| **Copilot-friendly** | Instructions claires et constantes |
| **Évolutif** | Base solide pour extensions futures |

---

> **Objectif final :**  
> Un Kanban clair, modulaire, lisible et élégant — capable d’enseigner les bonnes pratiques MVC à un débutant,  
> tout en satisfaisant un développeur expérimenté.
