<script>
    import Cookies from "js-cookie"
    import { navigate } from "svelte-routing"
    import { Flash } from "../store.js";
// @ts-nocheck

    let class_name = "";
    let password = "";

    const token = Cookies.get("token");

    if (token){
        fetch("http://www.hekpro.com/checklogin",{
            method:"GET",
            headers: new Headers({
                "authorization":"Bearer "+token, 
            })
            
        })
        .then((response)=>{
            if (response.status < 209){
                Flash.set("已登入");
            }
            console.log(response.status)
            return response.json()
        })
        .then((data) => {
            if (data.username)
                Cookies.set("username" , data.username)
                navigate("/admin")
        })
    }
    let error = "";

    const Login = () => {
        fetch("http://www.hekpro.com/login",{
            method: "POST",
            body: JSON.stringify({
                username: class_name,
                password: password
            }),
            headers: new Headers({
                "Content-Type":"application/json"
            })

        })
        .then((response) => response.json())
        .then((data) => {
            if (data.hasOwnProperty('access_token')){
                Cookies.set("token" , data.access_token);
                Cookies.set("username" , data.username);
                error = "";
                navigate("/admin");

            }else{
                error = data.msg;
            }

            console.log(data);
            
        })
    }


</script>

<div class="text-center flex flex-wrap justify-center border-4 w-fit pb-10 mx-auto mt-20 rounded-3xl">
    <h1 class="text-3xl mt-12 ">登入班級</h1>
    <div class="w-full h-20"></div>

    <p><input bind:value={class_name} type="text" class="border-2 p-2 rounded" placeholder="班級名稱" /></p>
    <div class="w-full"></div>

    <p><input bind:value={password} type="password" class="border-2 my-4 p-2 rounded" placeholder="密碼" /></p>
    <div class="w-full"></div>

    <div class="w-full h-10"></div>
    <button on:click={Login} class="border-2 border-black p-1 rounded hover:bg-slate-100">登入</button>
    <div class="w-full"></div>
    {#if error}
        <div class="text-red-600">{error}</div>
    {/if}
    
</div>
