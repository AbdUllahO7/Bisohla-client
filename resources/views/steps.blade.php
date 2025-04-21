@if(Auth::check())
    {{ Auth::user()->id }} // This should show the user ID if authenticated
@else 
    Not authenticated
@endif 

<div>
    Session ID: {{ session()->getId() }}<br>
    Auth Check: {{ Auth::check() ? 'true' : 'false' }}<br>
    User ID: {{ Auth::id() ?? 'null' }}
</div> 