<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Kanban (SortableJS, no backend)</title>
</head>
<body>
<div class="wrap">




    <div class="toolbar">
    <h1 class="title" id="kanban-title">Kanban</h1>
    <button id="kanban-title-warn" type="button" class="btn" style="margin-left:8px; display:none;"></button>
        <div>
            <button class="btn" id="toggleTheme" title="Basculer thème">Mode clair</button>
            <button class="btn" id="createTicket">Créer nouveau ticket</button>
            <button class="btn" id="addRandom">Ajouter une carte aléatoire</button>
            <button class="btn" id="downloadJson">Télécharger JSON</button>
            <button class="btn" id="importJson">Importer JSON</button>
            <button class="btn" id="resetBoard">Réinitialiser</button>
        </div>
    </div>
    <div id="kanban-filters" class="filters"></div>
    



      <div id="kanban-root"></div>


    <p class="credits">JS POO + SortableJS. Aucun backend; données en mémoire/localStorage.</p>

    






<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
  Launch demo modal
</button>
<div class="modal" id="exampleModal" tabindex="-1">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Modal title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci animi beatae delectus
        deleniti dolorem eveniet facere fuga iste nemo nesciunt nihil odio perspiciatis, quia quis
        reprehenderit sit tempora totam unde.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn me-auto" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
      </div>
    </div>
  </div>
</div>


</div>

<!-- @vite('resources/js/kanban/index.js') -->
<!-- @vite('resources/js/kanban2/_bootstrap.js') -->

@vite('resources/js/kanban2/index.js')

</body>
</html>
