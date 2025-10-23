# deljdlx/kanban (Laravel package skeleton)

Minimal Laravel 12 package ready to host Kanban features.

- PSR-12, typed, documented
- Auto-discovered ServiceProvider
- Optional config and routes stubs

## Install (path repository)

Add to app composer.json:

```
"repositories": [{
  "type": "path",
  "url": "packages/deljdlx/kanban",
  "options": { "symlink": true }
}],
"require": {
  "deljdlx/kanban": "*@dev"
}
```

Then install:

```
composer update deljdlx/kanban
```

(Optional) load routes/config in ServiceProvider when needed.
