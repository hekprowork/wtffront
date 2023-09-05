<script>
    import { showSideBar } from '../../store.js'
    import { link , navigate } from 'svelte-routing'
    import Cookies from 'js-cookie'
    export let white;
    export let position;

    const username = Cookies.get("username");

    if (!username){
        navigate("/login");
    }

    function closeSideBar(){
        showSideBar.update((value) => !value);
        console.log($showSideBar);
    }

    const positionToDropDownClass = () => {
        if (position === "left"){
            return "top-0 left-0 h-screen";
        }
        else if (position === "top"){
            return "top-0 w-screen";
        }
    }

    const positionToContent = () => {
        if (position === "left"){
            return "block";
        }
        else if (position === "top"){
            return "inline";
        }
    }

    const roundPosition = () => {
        if (position === "left"){
            return "r";
        }
        else if (position === "top"){
            return "b";
        }
    }

    const list = [
        {
            id:0,
            name:"班級資訊",
            path:"/admin"
        },
        {
            id:1,
            name:"功課",
            path:"/admin/works"
        },
        {
            id:2,
            name:"考試",
            path:"/admin/exams"
        },
        {
            id:3,
            name:"課表",
            path:"/admin/schedule"
        },
        {
            id:4,
            name:"登出",
            path:"/logout"
        },
        
    ]

</script>

<button on:click={closeSideBar} class="fixed top-0 left-0 z-40 hover:bg-zinc-300">關閉側邊欄</button>

{#if $showSideBar}
<div class="fixed {positionToDropDownClass()} bg-slate-400 rounded-{roundPosition()}-lg pt-10" >
    
    {#each list as linkitem (linkitem.id)}
        {#if linkitem.name === white}
            <p class="bg-white my-4 md-4 px-3 {positionToContent()}">{linkitem.name}</p>
        {:else}
            <a href={linkitem.path} class="{positionToContent()} list-none my-4 px-3 hover:bg-slate-300 transition-colors duration-300" use:link>{linkitem.name}</a>
        {/if}
    {/each}

    <p class="bg-orange-300 my-4 md-4 px-3 rounded-2xl text-center text-blue-900">{username}</p>
    
</div>
{/if}