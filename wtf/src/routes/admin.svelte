<script>
    import { link , navigate } from 'svelte-routing';
    import  Cookies  from 'js-cookie';
    import { Flash, showSideBar } from '../store.js';
    import Sidebar from './tool/sidebar.svelte';
    
    const token = Cookies.get("token");

    if (!token){
        navigate("/login");
    }

    let doing = false;
    

    let className = "";
    let pageName = ""; 
    let remind = "";

    let lastClassName = "";
    let lastPageName = "";
    let lastRemind = "";

    const turnOffEdit = () => {

        let changeBody = {};
        if (className != lastClassName){
            changeBody.ClassName = className;
        }
        if (pageName != lastPageName){
            changeBody.PageName = pageName;
        }
        if (remind != lastRemind){
            changeBody.Remind = remind;
        }
        
        if (Object.keys(changeBody).length == 0){
            return;
        }


        doing = true;

        fetch("http://www.hekpro.com/class/" , {
            method:"PATCH",
            headers: new Headers({
                "authorization":"Bearer "+token,
                "Content-Type":"application/json",
            }),
            body:JSON.stringify(changeBody),
        })
        .then((response)=>{
            if (response.status == 401){
                Flash.set("您還未登入");
                navigate("/login")
            }
            lastClassName = className;
            lastPageName = pageName;
            lastRemind = remind;
            doing = false;
        })
        .catch((error) => console.log(error))
    }
    

    fetch("http://www.hekpro.com/class/" , {
        method: "Get",
        headers: new Headers({
            "Authorization":"Bearer "+token,
        })
    })
    .then((response)=>{
        if (response.status == 401){
            Cookies.remove("token");
            navigate("/login");
        }
        return response.json();
        
    })
    .then((data)=>{
        className = lastClassName = data.ClassName;
        pageName = lastPageName = data.PageName;
        remind = lastRemind = data.Remind;
    })

</script>

<Sidebar white="班級資訊" position="left" />

<div class="border-4 h-screen pl-6 rounded-lg pt-10 ml-{$showSideBar*28}">

    <p>班級名稱<br>
        <input 
        class="rounded-full focus:border-2 border-0"
        on:blur={turnOffEdit}
        type="text" bind:value={className}/>
    </p>

    <p class="my-4">頁面名稱<br>
        <input 
        class="rounded-full focus:border-2 border-0"
        on:blur={turnOffEdit}
        type="text" bind:value={pageName}/>
    </p>

    <p class="my-4">提醒事項<br>
        <textarea 
        class="rounded-lg h-40 p-2 focus:border-2 border-0"
        on:blur={turnOffEdit}
        bind:value={remind}/>
    </p>

    {#if doing}
    <p class="text-red-600">正在傳送請求...</p>
    {/if}
</div>