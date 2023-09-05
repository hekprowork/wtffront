<script>
    import Sidebar from "./tool/sidebar.svelte";
    import Cookies from "js-cookie";
    import { Flash } from "../store";

    let schedules;

    let origSchedule;

    let token = Cookies.get("token");

    let subjects;

    let completeSuggest;

    let completeTarget = false;



    $: {
        if (completeTarget === false) break $;
        let nowWord = schedules[completeTarget];
        let wordLength = nowWord.length;
        let possibleSuggests = [...subjects , ...schedules];
        possibleSuggests = [...new Set(possibleSuggests)];
        completeSuggest = possibleSuggests.filter((suggest)=>suggest.slice(0,wordLength) === nowWord);
    }

    fetch("http://www.hekpro.com/schedule/" , {
        method: "GET",
        headers: new Headers({
            "Authorization":"Bearer "+token,
        })
    })
    .then((response)=>response.json())
    .then((data) => {
        schedules = data.schedules;
        origSchedule = [...schedules];
    })

    fetch("http://www.hekpro.com/subjects/" , {
        method: "GET",
        headers: new Headers({
            "Authorization":"Bearer "+token,
        })
    })
    .then((res) => res.json())
    .then((data) => {
        subjects = data.msg;
    })

    const saveSchedule = () => {
        let scheduleChangesObject = {};
        schedules.forEach((value , index) => {
            if (value !== origSchedule[index]){
                scheduleChangesObject[index.toString()] = value;
            }
        })


        fetch("http://www.hekpro.com/schedule/" , {
            method: "PUT",
            headers: new Headers({
                "Authorization":"Bearer "+token,
                "Content-Type":"application/json",
            }),
            body:JSON.stringify(scheduleChangesObject),
        })
        .then((res) => {
            if (res.status < 209){
                Flash.set("儲存課表成功");
            }
        })
    }
</script>

<Sidebar white="課表" position="top" />

<div class="mt-32 bg-slate-100">
{#if schedules}
<table class="mx-auto">
    <tr>
        <th></th>
        <th>星期一</th>
        <th>星期二</th>
        <th>星期三</th>
        <th>星期四</th>
        <th>星期五</th>
    </tr>
    {#each Array(9) as _ , row}
    <tr>
        <td>{row+1}</td>
        {#each Array(5) as _ , grid}
            <td class="relative text-blue-600">
                <input 
                class="w-12 p-0 border-0 rounded-sm bg-slate-100" 
                type="text" 
                on:focus={() => completeTarget = row*5+grid}
                on:blur={() => completeTarget = false}
                bind:value={schedules[row*5+grid]} />
                {#if completeTarget === row*5+grid}
                <div class="absolute z-10 bg-amber-300">
                    {#each completeSuggest as suggest}
                        <button class="block" on:mousedown={() => schedules[row*5+grid] = suggest}>{suggest}</button>
                    {/each}
                </div>
                {/if}
            </td>
        {/each}
    </tr>
    {/each}
</table>
{/if}

<button on:click={saveSchedule} class="text-blue-600 mx-auto block">
<svg class="w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>
<span>儲存課表</span>
</button>
</div>


<style>
    td {
        padding: 8px;

    }
</style>