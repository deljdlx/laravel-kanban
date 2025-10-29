<div class="card">
  <div class="card-body">

    @if(isset($heading))
        <h3 class="card-title">{{ $heading }}</h3>
    @endif

    {{ $slot }}
  </div>
</div>