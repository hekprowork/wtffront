<script>
    //fetch()

    import Sidebar from "./tool/sidebar.svelte";
    import Cookies from "js-cookie";
    import { Flash } from "../store.js";
    import { showSideBar } from "../store.js";
    import { navigate } from "svelte-routing";

    let token = Cookies.get("token");

    let works = [] , baseworks = [];

    let completeTarget = false;

    let completeSuggest;

    let all_subject;


    $: {
        if (completeTarget === false) break $;
        completeSuggest = [];
        let nowWord , wordLength;
        
        let possibleSuggests;
        if (completeTarget[1] === 1){
            nowWord = works[completeTarget[0]][1];
            
            possibleSuggests = [...all_subject];
        }
        else if(completeTarget[1] === 2){
            let targetSubject = works[completeTarget[0]][1];
            nowWord = works[completeTarget[0]][2];
            possibleSuggests = [];
            baseworks.forEach((item) => {
                if (item[1] === targetSubject)
                    possibleSuggests.push([item[0] , item[2]]);
            })

        }
        wordLength = nowWord.length;
        completeSuggest = possibleSuggests.filter((suggest) => suggest[1].slice(0 , wordLength) === nowWord);
    }

    $: {
        works.sort((a , b)=>{
            if (a[4] === ""){
                return -1;
            }else if (b[4] === ""){
                return 1;
            }
            const aDate = new Date(a[4])
            const bDate = new Date(b[4])
            return bDate - aDate;
        })
    }

    if (!token){
        navigate("/login");
    }

    fetch("http://www.hekpro.com/works/work/" , {
        method:"GET",
        headers:new Headers({
            "Authorization":"Bearer "+token,
        }),
    })
    .then((response) => {
        if (response.status == 401){
            Flash.set("您還未登入");
            navigate("/login");
        }
        return response.json();
    })
    .then((data) => {
        works = data.works;
        works.forEach(element => {
            element[5] = 0;
            element[6] = false;
        });
    })

    fetch("http://www.hekpro.com/subjects/" , {
        method:"GET",
        headers: new Headers({
            "Authorization":"Bearer "+token,
        })
    })
    .then((res) => res.json())
    .then((data) => {
        all_subject = data.msg;
    })

    fetch("http://www.hekpro.com/basework/" , {
        method:"GET",
        headers: new Headers({
            "Authorization":"Bearer "+token,
        })
    })
    .then((res) => res.json())
    .then((data) => {
        baseworks = data.msg;
    })

    const deleteWork = (workId) => {
        return () => {
            fetch("http://www.hekpro.com/works/"+workId+"/" , {
                method: "DELETE",
                headers: new Headers({
                    "Authorization":"Bearer "+token,
                })
            })
            .then((res) => {
                if (res.status < 209){
                    Flash.set("成功刪除作業");
                    let index = works.findIndex(item => item[0] === workId);
                    works.splice(index , 1);
                    works = works;
                }
            })
        }
    }

    const updateWork = (work) => {
        return () => {
            if (work.includes("")){
                alert("不得有空白項目");
                return;
            }
            work[5] = 1;
            works = works;
            fetch("http://www.hekpro.com/works/"+work[0]+"/" , {
                method: "PATCH",
                headers: new Headers({
                    "Authorization":"Bearer "+token,
                    "Content-Type":"application/json",
                }),
                body: JSON.stringify({
                    subjectName:work[1],
                    baseWorkName:work[2],
                    range:work[3],
                    DueTime:work[4],
                })
            })
            .then((res) => {
                if (res.status < 209){
                    Flash.set("更新功課完成");
                    work[6] = false;
                    work[5] = 2;
                    works = works;
                }
            })
        }
    }
    
    const settingNewWork = () => {
        works.push([-1 , "" , "" , "" , "" , 1 , true]);
        works = works;
    }

    const deleteNewWork = (workId) => {
        works = works.slice(1);
    }

    const createWork = (work) => {
        if (work.includes("")){
            alert("不得有空白項目");
            return;
        }
        
        fetch("http://www.hekpro.com/works/work/" , {
            method:"POST",
            headers: new Headers({
                "Authorization":"Bearer "+token,
                "Content-Type":"application/json",
            }),
            body: JSON.stringify({
                subject:work[1],
                baseWorkName:work[2],
                range:work[3],
                DueTime:work[4],
            })
        })
        .then((res) => res.json())
        .then((data) => {
            work[0] = data.id;
            work[5] = 2;
            work[6] = false;
            works = works;
        })
    }

    const TurnSubjectSuggestOff = (subjectId) => {
        fetch("http://www.hekpro.com/subjects/"+subjectId+"/" , {
            method:"DELETE",
            headers: new Headers({
                "Authorization":"Bearer "+token,
            })
        })
        .then((res) => {
            if (res.status < 209){
                let subject_index = all_subject.findIndex((subject) => subject[0] == subjectId);
                all_subject.splice(subject_index , 1);
            }
        })
    }

    const TurnBaseWorkSuggestOff = (baseworkId) => {
        fetch("http://www.hekpro.com/subjects/"+baseworkId+"/" , {
            method:"DELETE",
            headers: new Headers({
                "Authorization":"Bearer "+token,
            })
        })
        .then((res) => {
            if (res.status < 209){
                let basework_index = baseworks.findIndex((basework) => basework[0] == baseworkId);
                baseworks.splice(basework_index , 1);
            }
        })
    }

    //const


</script>

<Sidebar white="功課" position="top"/>


<div class="mt-{10 + $showSideBar*22}">
    {#if works}
    
    <div class="bg-slate-100 p-0 rounded-lg border-2 w-full mx-auto">

    <button on:click={settingNewWork} class="block mx-auto my-3"><svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="#3b82f6" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
    </button>
        

    <table class="mx-auto">
    <tr>
        <th class="w-16">科目</th>
        <th class="w-20">功課別</th>
        <th class="w-20">範圍</th>
        <th class="w-28">繳交日期</th>
    </tr>
    {#each works as work , index (work[0])}
    {#if work[0] === -1}
    <tr class="text-blue-600 relative h-14 align-top">
        <td><input 
            type="text"
            class="border-0 bg-slate-100 rounded-sm p-0 focus:border-1 w-16 text-center" 
            bind:value={work[1]}
            on:focus={() => completeTarget = [index , 1]}
            on:blur={() => completeTarget = false} />
            {#if completeTarget[0] == index && completeTarget[1] == 1}
            <div class="absolute z-10 bg-amber-300">
                {#each completeSuggest as suggest}
                    <div>
                        <button class="inline" on:mousedown={() => work[1] = suggest[1]}>{suggest[1]}</button>
                        <svg on:mousedown={TurnSubjectSuggestOff(suggest[0])} class="w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </div>
                {/each}
            </div>
            {/if}
        </td>
        <td>
            <input 
            type="text" 
            class="border-0 bg-slate-100 rounded-sm p-0 focus:border-1 w-20 text-center"
            bind:value={work[2]}
            on:focus={() => completeTarget = [index , 2]}
            on:blur={() => completeTarget = false} />
            {#if completeTarget[0] == index && completeTarget[1] == 2}
            <div class="absolute z-10 bg-amber-300">
                {#each completeSuggest as suggest}
                    <div>
                        <button class="inline" on:mousedown={() => work[2] = suggest[1]}>{suggest[1]}</button>
                        <svg on:mousedown={TurnBaseWorkSuggestOff(suggest[0])} class="w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </div>
                {/each}
            </div>
            {/if}
        </td>
        <td>
            <input 
            type="text" 
            class="border-0 bg-slate-100 rounded-sm p-0 focus:border-1 w-20 text-center"
            bind:value={work[3]} />
        </td>
        <td>
            <input 
            type="date" 
            class="border-0 bg-slate-100 rounded-sm p-0 focus:border-1 w-28 text-center"
            bind:value={work[4]}
            pattern=""/>
        </td>
            <svg on:click={deleteNewWork(work[0])} class="w-4 inline absolute right-2 top-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
              
            {#if work[6]}
            <svg on:click={createWork(work)} class="w-4 inline absolute right-10 top-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
              
            {/if}

            {#if work[5] === 1}
            <svg class="w-4 inline absolute -left-3 top-2" xmlns="http://www.w3.org/2000/svg" width="10" height="10">
                <circle cx="5" cy="5" r="5" fill="red" />
            </svg>
            {/if}
    </tr>
    {:else}
    <tr class="text-blue-600 relative h-14 align-top">
            <td><input 
                type="text"
                class="border-0 bg-slate-100 rounded-sm p-0 focus:border-1 w-16 text-center" 
                bind:value={work[1]}
                on:change={() => work[6] = true}
                on:focus={() => completeTarget = [index , 1]}
                on:blur={() => completeTarget = false} />
                {#if completeTarget[0] == index && completeTarget[1] == 1}
                <div class="absolute z-10 bg-amber-300">
                    {#each completeSuggest as suggest}
                    <div>
                        <button class="inline" on:mousedown={() => work[1] = suggest[1]}>{suggest[1]}</button>
                        <svg on:mousedown={TurnSubjectSuggestOff(suggest[0])} class="w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </div>
                    {/each}
                </div>
                {/if}
            </td>
            <td>
                <input 
                type="text" 
                class="border-0 bg-slate-100 rounded-sm p-0 focus:border-1 w-20 text-center"
                bind:value={work[2]}
                on:change={() => work[6] = true}
                on:focus={() => completeTarget = [index , 2]}
                on:blur={() => completeTarget = false} />
                {#if completeTarget[0] == index && completeTarget[1] == 2}
                <div class="absolute z-10 bg-amber-300">
                    {#each completeSuggest as suggest}
                    <div>
                        <button class="inline" on:mousedown={() => work[2] = suggest[1]}>{suggest[1]}</button>
                        <svg on:mousedown={TurnBaseWorkSuggestOff(suggest[0])} class="w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </div>
                    {/each}
                </div>
                {/if}
            </td>
            <td>
                <input 
                type="text" 
                class="border-0 bg-slate-100 rounded-sm p-0 focus:border-1 w-20 text-center"
                bind:value={work[3]}
                on:change={() => work[6] = true} />
            </td>
            <td>
                <input 
                type="date" 
                class="border-0 bg-slate-100 rounded-sm p-0 focus:border-1 w-28 text-center"
                bind:value={work[4]}
                pattern=""
                on:change={() => work[6] = true} />
            </td>
                <svg on:click={deleteWork(work[0])} class="w-4 inline absolute right-2 top-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                  
                {#if work[6]}
                <svg on:click={updateWork(work)} class="w-4 inline absolute right-10 top-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                  
                {/if}

                {#if work[5] === 1}
                <svg class="w-4 inline absolute -left-3 top-2" xmlns="http://www.w3.org/2000/svg" width="10" height="10">
                    <circle cx="5" cy="5" r="5" fill="red" />
                </svg>
                {:else if work[5] === 2}
                <svg class="w-4 inline absolute -left-3 top-2" xmlns="http://www.w3.org/2000/svg" width="10" height="10">
                    <circle cx="5" cy="5" r="5" fill="green" />
                </svg>
                {/if}

    </tr>
    {/if}
    {/each}
    </table>
    </div>
    {/if}
</div>

