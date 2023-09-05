<script>
  import { Router , Route , navigate } from 'svelte-routing'
  import Home from './routes/home.svelte'
  import Login from './routes/login.svelte'
  import Admin from './routes/admin.svelte'
  import Logout from './routes/logout.svelte'
  import Works from './routes/works.svelte'
  import Exams from './routes/exams.svelte'
  import Schedule from './routes/schedule.svelte'
  import { Flash } from './store.js'




</script>
{#if $Flash}
<p class="ml-28 fixed top-0 w-screen z-50">{$Flash}</p>
{/if}

<Router>
    <Route path="/" component={Home} />
    <Route path="/login" component={Login} />
    <Route path="/admin" component={Admin} />
    <Route path="/logout" component={Logout} />
    <Route path="/admin/works" component={Works} />
    <Route path="/admin/exams" component={Exams} />
    <Route path="/admin/schedule" component={Schedule} />
</Router>

<style>
  @import './tailwind.css';
</style>