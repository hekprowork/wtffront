<script>
    import Cookies from "js-cookie";
    import { Flash } from "../store.js";
    import { navigate , link } from "svelte-routing"
    import { showSideBar } from "../store.js";

    let token = Cookies.get("token");

    let doing = true;

    let sideBar = true;

    if (!token){
        Flash.set("還未登入");
        navigate("/login");
    }
    fetch("http://www.hekpro.com/logout" , {
        method:"DELETE",
        headers: new Headers({
            "Authorization":"Bearer "+token,
        })
    })
    .then(()=>{
        doing = false;
        Cookies.remove("token");
        Cookies.remove("username");
    })
    
</script>

<div class="ml-{$showSideBar*28} pt-10">
{#if doing}
    處理中，請稍等
{:else}
    已登出完畢 <a use:link href="/login" class="text-blue-600">重新登入</a>
{/if}

</div>



