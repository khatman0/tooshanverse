/*══════════════════════════════════════
        TOOSHAN TREASURY V3
              PART 1
══════════════════════════════════════*/

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {
    SUPABASE_URL,
    SUPABASE_KEY
} from "./supabase-config.js";

/*══════════════════════════════════════
              SUPABASE
══════════════════════════════════════*/

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/*══════════════════════════════════════
             GLOBAL STATE
══════════════════════════════════════*/

export let user = null;
export let profile = null;

export let coins = 0;
export let xp = 0;
export let level = 1;
export let storiesRead = 0;

export let inventory = [];

/*══════════════════════════════════════
                DOM
══════════════════════════════════════*/

const coinBalance =
document.getElementById("coinBalance");

const xpBalance =
document.getElementById("xpBalance");

const levelBalance =
document.getElementById("levelBalance");

const historyList =
document.getElementById("historyList");

const featuredBuy =
document.getElementById("featuredBuy");

/*══════════════════════════════════════
              CURSOR
══════════════════════════════════════*/

const cursor =
document.getElementById("cursor");

const ring =
document.getElementById("cursor-ring");

let mouseX=0;
let mouseY=0;

let ringX=0;
let ringY=0;

document.addEventListener("mousemove",e=>{

mouseX=e.clientX;
mouseY=e.clientY;

});

function animateCursor(){

if(cursor){

cursor.style.left=mouseX+"px";
cursor.style.top=mouseY+"px";

}

ringX+=(mouseX-ringX)*0.15;
ringY+=(mouseY-ringY)*0.15;

if(ring){

ring.style.left=ringX+"px";
ring.style.top=ringY+"px";

}

requestAnimationFrame(
animateCursor
);

}

animateCursor();

/*══════════════════════════════════════
            HAMBURGER
══════════════════════════════════════*/

const hamburger=
document.getElementById(
"hamburgerBtn"
);

const sideNav=
document.getElementById(
"sideNav"
);

const overlay=
document.getElementById(
"overlay"
);

function openMenu(){

hamburger?.classList.add(
"active"
);

sideNav?.classList.add(
"active"
);

overlay?.classList.add(
"active"
);

}

function closeMenu(){

hamburger?.classList.remove(
"active"
);

sideNav?.classList.remove(
"active"
);

overlay?.classList.remove(
"active"
);

}

hamburger?.addEventListener(

"click",

()=>{

sideNav.classList.contains(
"active"
)

?closeMenu()

:openMenu();

}

);

overlay?.addEventListener(

"click",

closeMenu

);

/*══════════════════════════════════════
            TOUCH CLOSE
══════════════════════════════════════*/

let touchStart=0;

sideNav?.addEventListener(

"touchstart",

e=>{

touchStart=
e.touches[0].clientX;

}

);

sideNav?.addEventListener(

"touchend",

e=>{

const end=
e.changedTouches[0].clientX;

if(end-touchStart<-80){

closeMenu();

}

}

);

/*══════════════════════════════════════
        SCROLL OBSERVER
══════════════════════════════════════*/

export const observer=

new IntersectionObserver(

entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add(
"show"
);

}

});

},

{

threshold:.15

}

);

document.querySelectorAll(

".wallet-card,.mission-card,.featured-card,.shop-card,.history-item"

).forEach(el=>{

observer.observe(el);

});

/*══════════════════════════════════════
          COUNTER
══════════════════════════════════════*/

export function animateNumber(

element,

target

){

if(!element) return;

let value=0;

const speed=Math.max(

1,

Math.ceil(target/70)

);

const timer=

setInterval(()=>{

value+=speed;

if(value>=target){

value=target;

clearInterval(timer);

}

element.textContent=

value.toLocaleString();

},20);

}

/*══════════════════════════════════════
            UPDATE UI
══════════════════════════════════════*/

export function updateUI(){

animateNumber(

coinBalance,

coins

);

animateNumber(

xpBalance,

xp

);

if(levelBalance){

levelBalance.textContent=

level;

}

}

/*══════════════════════════════════════
              TOAST
══════════════════════════════════════*/

export function showToast(text){

const toast=

document.createElement("div");

toast.className="toast";

toast.innerText=text;

document.body.appendChild(
toast
);

setTimeout(()=>{

toast.classList.add(
"show"
);

},50);

setTimeout(()=>{

toast.classList.remove(
"show"
);

setTimeout(()=>{

toast.remove();

},300);

},2500);

}

/*══════════════════════════════════════
            PAGE READY
══════════════════════════════════════*/

window.addEventListener(

"load",

()=>{

document.body.classList.add(
"loaded"
);

console.log(

"%cTOOSHAN TREASURY V3",

"color:#19a7ff;font-size:18px;font-weight:bold"

);

});
/*══════════════════════════════════════
        TOOSHAN TREASURY V3
          PART 2 - SECTION 1
        AUTH + PROFILE + WALLET
══════════════════════════════════════*/


/*══════════════════════════════════════
            GET USER
══════════════════════════════════════*/

export async function getCurrentUser(){

    const {

        data:{user:currentUser},

        error

    } = await supabase.auth.getUser();

    if(error){

        console.error(error);

        showToast("خطا در احراز هویت");

        return null;

    }

    return currentUser;

}


/*══════════════════════════════════════
            LOAD PROFILE
══════════════════════════════════════*/

export async function loadProfile(){

    user = await getCurrentUser();

    if(!user){

        location.href="login.html";

        return;

    }

    const {

        data,

        error

    } = await supabase

    .from("profiles")

    .select("*")

    .eq("id",user.id)

    .single();

    if(error){

        console.error(error);

        showToast("خطا در دریافت اطلاعات");

        return;

    }

    profile = data;

    coins = Number(profile.coins)||0;

    xp = Number(profile.xp)||0;

    level = Number(profile.level)||1;

    storiesRead = Number(profile.stories_read)||0;

    updateUI();

}


/*══════════════════════════════════════
            SAVE PROFILE
══════════════════════════════════════*/

export async function saveProfile(){

    if(!user) return;

    const { error } = await supabase

    .from("profiles")

    .update({

        coins,

        xp,

        level,

        stories_read:storiesRead,

        updated_at:new Date()

    })

    .eq("id",user.id);

    if(error){

        console.error(error);

    }

}


/*══════════════════════════════════════
          REFRESH PROFILE
══════════════════════════════════════*/

export async function refreshProfile(){

    if(!user) return;

    const {

        data,

        error

    } = await supabase

    .from("profiles")

    .select("coins,xp,level,stories_read")

    .eq("id",user.id)

    .single();

    if(error){

        console.error(error);

        return;

    }

    coins = data.coins;

    xp = data.xp;

    level = data.level;

    storiesRead = data.stories_read;

    updateUI();

}


/*══════════════════════════════════════
            SAVE TIMER
══════════════════════════════════════*/

setInterval(()=>{

    if(user){

        saveProfile();

    }

},30000);


/*══════════════════════════════════════
          REFRESH TIMER
══════════════════════════════════════*/

setInterval(()=>{

    if(user){

        refreshProfile();

    }

},60000);


/*══════════════════════════════════════
           START PROFILE
══════════════════════════════════════*/

window.addEventListener(

"load",

async()=>{

    await loadProfile();

});
/*══════════════════════════════════════
        TOOSHAN TREASURY V3
          PART 2 - SECTION 2
      WALLET FUNCTIONS + LEVEL SYSTEM
══════════════════════════════════════*/


/*══════════════════════════════════════
            ADD COINS
══════════════════════════════════════*/

export async function addCoins(amount){

    coins += amount;

    updateUI();

    await saveProfile();

}


/*══════════════════════════════════════
          REMOVE COINS
══════════════════════════════════════*/

export async function removeCoins(amount){

    if(coins < amount){

        showToast("سکه کافی نداری.");

        return false;

    }

    coins -= amount;

    updateUI();

    await saveProfile();

    return true;

}


/*══════════════════════════════════════
              ADD XP
══════════════════════════════════════*/

export async function addXP(amount){

    xp += amount;

    checkLevel();

    updateUI();

    await saveProfile();

}


/*══════════════════════════════════════
            REMOVE XP
══════════════════════════════════════*/

export async function removeXP(amount){

    if(xp < amount){

        showToast("XP کافی نداری.");

        return false;

    }

    xp -= amount;

    updateUI();

    await saveProfile();

    return true;

}


/*══════════════════════════════════════
          LEVEL CALCULATION
══════════════════════════════════════*/

export function calculateLevel(totalXP){

    return Math.floor(totalXP / 100) + 1;

}


/*══════════════════════════════════════
            CHECK LEVEL
══════════════════════════════════════*/

export function checkLevel(){

    const newLevel = calculateLevel(xp);

    if(newLevel <= level) return;

    level = newLevel;

    updateUI();

    saveProfile();

    showToast(

        "🎉 به سطح " +

        level +

        " رسیدی."

    );

}


/*══════════════════════════════════════
           STORY COUNTER
══════════════════════════════════════*/

export async function addStoryRead(){

    storiesRead++;

    await saveProfile();

}


/*══════════════════════════════════════
          RESET WALLET
══════════════════════════════════════*/

export async function resetWallet(){

    coins = 0;

    xp = 0;

    level = 1;

    storiesRead = 0;

    updateUI();

    await saveProfile();

}


/*══════════════════════════════════════
         WALLET OBJECT
══════════════════════════════════════*/

export function getWallet(){

    return {

        coins,

        xp,

        level,

        storiesRead

    };

}


/*══════════════════════════════════════
        UPDATE FROM DATABASE
══════════════════════════════════════*/

export function updateWallet(data){

    coins = Number(data.coins) || 0;

    xp = Number(data.xp) || 0;

    level = Number(data.level) || 1;

    storiesRead = Number(data.stories_read) || 0;

    updateUI();

}


/*══════════════════════════════════════
           PAGE READY
══════════════════════════════════════*/

console.log(

"%cWallet System Loaded",

"color:#00d4ff;font-weight:bold;"

);
/*══════════════════════════════════════
        TOOSHAN TREASURY V3
          PART 3 - SECTION 1
      SHOP FILTER + SHOP EFFECTS
══════════════════════════════════════*/


/*══════════════════════════════════════
            SHOP ELEMENTS
══════════════════════════════════════*/

const categoryButtons =
document.querySelectorAll(".category");

const shopCards =
document.querySelectorAll(".shop-card");

const buyButtons =
document.querySelectorAll(".buy-item");


/*══════════════════════════════════════
          CATEGORY FILTER
══════════════════════════════════════*/

categoryButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        document

        .querySelectorAll(".category")

        .forEach(item=>{

            item.classList.remove("active");

        });

        button.classList.add("active");

        const filter =
        button.dataset.filter;

        shopCards.forEach(card=>{

            const category =
            card.dataset.category;

            if(

                filter==="all" ||

                category===filter

            ){

                card.style.display="block";

                requestAnimationFrame(()=>{

                    card.style.opacity="1";

                    card.style.transform=

                    "translateY(0px)";

                });

            }else{

                card.style.opacity="0";

                card.style.transform=

                "translateY(35px)";

                setTimeout(()=>{

                    card.style.display="none";

                },250);

            }

        });

    });

});


/*══════════════════════════════════════
            SHOP HOVER
══════════════════════════════════════*/

shopCards.forEach(card=>{

    card.addEventListener(

    "mousemove",

    e=>{

        const rect=

        card.getBoundingClientRect();

        const x=

        e.clientX-rect.left;

        const y=

        e.clientY-rect.top;

        card.style.background=

        `radial-gradient(

        circle at ${x}px ${y}px,

        rgba(25,167,255,.14),

        rgba(8,14,28,.85) 72%

        )`;

    });

    card.addEventListener(

    "mouseleave",

    ()=>{

        card.style.background="";

    });

});


/*══════════════════════════════════════
        RANDOM GLOW EFFECT
══════════════════════════════════════*/

setInterval(()=>{

    shopCards.forEach(card=>{

        card.style.boxShadow=

        `0 0 ${

        Math.random()*25+10

        }px rgba(

        25,

        167,

        255,

        .16

        )`;

    });

},2500);


/*══════════════════════════════════════
          FEATURED BUTTON
══════════════════════════════════════*/

featuredBuy?.addEventListener(

"click",

()=>{

    showToast(

    "این قابلیت به‌زودی فعال می‌شود."

    );

});


/*══════════════════════════════════════
         COIN EXPLOSION
══════════════════════════════════════*/

export function createCoinBurst(element){

    const rect=

    element.getBoundingClientRect();

    for(

        let i=0;

        i<12;

        i++

    ){

        const coin=

        document.createElement(

        "div"

        );

        coin.className=

        "coin-spark";

        coin.innerHTML="🪙";

        coin.style.left=

        rect.left+

        rect.width/2+

        "px";

        coin.style.top=

        rect.top+

        rect.height/2+

        "px";

        coin.style.transform=

        `translate(

        ${(Math.random()-.5)*180}px,

        ${(Math.random()-.5)*180}px

        )`;

        document.body

        .appendChild(

        coin

        );

        setTimeout(()=>{

            coin.remove();

        },900);

    }

}


/*══════════════════════════════════════
        SHOP READY
══════════════════════════════════════*/

console.log(

"%cShop UI Loaded",

"color:#00d4ff;font-weight:bold;"

);
/*══════════════════════════════════════
        TOOSHAN TREASURY V3
          PART 3 - SECTION 2
     SHOP PURCHASE + TRANSACTIONS
══════════════════════════════════════*/


/*══════════════════════════════════════
          BUY ITEM SYSTEM
══════════════════════════════════════*/
buyButtons.forEach(button=>{

    button.addEventListener(
    "click",
    async()=>{

        const card = button.closest(".shop-card");

        if(!card) return;

        const itemId = card.dataset.id;
        const itemName = card.dataset.name;
        const category = card.dataset.category;
        const price = Number(card.dataset.price);

        if(!itemId){
            showToast("خطای داخلی: شناسه آیتم یافت نشد.");
            return;
        }

        if(inventory.some(item => item.item_id === itemId)){
            showToast("این آیتم قبلاً خریداری شده است.");
            return;
        }

        button.disabled = true; // جلوگیری از دابل‌کلیک حین درخواست

        const { data, error } = await supabase.rpc("purchase_item", {
            p_item_id: itemId,
            p_item_name: itemName,
            p_category: category,
            p_price: price
        });

        if(error){
            console.error(error);
            showToast(error.message || "خطا در خرید.");
            button.disabled = false;
            return;
        }

        // موفقیت: state محلی رو sync کن
        coins = data.remaining_coins;
        updateUI();

        inventory.push({
            item_id: itemId,
            item_name: itemName,
            category: category,
            equipped: false
        });

        button.classList.add("owned");
        button.innerText = "خرید شده";

        createCoinBurst(button);
        addTransaction("-"+price, itemName);
        showToast(itemName+" خریداری شد.");
    });
});


/*══════════════════════════════════════
        TRANSACTION HISTORY
══════════════════════════════════════*/

export function addTransaction(

value,

title

){

    if(!historyList) return;

    const row=

    document.createElement(

    "div"

    );

    row.className=

    "history-item";

    row.innerHTML=`

    <div>

        <h4>${title}</h4>

        <small>

        چند لحظه پیش

        </small>

    </div>

    <strong class="${
        value.includes("+")
        ?"plus"
        :"minus"
    }">

    ${value}

    </strong>

    `;

    historyList.prepend(

    row

    );

    observer.observe(

    row

    );

}


/*══════════════════════════════════════
        HISTORY EXPAND
══════════════════════════════════════*/

document.addEventListener(

"click",

e=>{

    const row=

    e.target.closest(

    ".history-item"

    );

    if(!row) return;

    row.classList.toggle(

    "expanded"

    );

});


/*══════════════════════════════════════
      LOAD OWNED ITEMS
══════════════════════════════════════*/

export function refreshOwnedItems(){

    buyButtons.forEach(button=>{

        const card=

        button.closest(

        ".shop-card"

        );

        if(!card) return;

        const itemId=

        card.dataset.id;

        const owned=

        inventory.some(

        item=>

        item.item_id===itemId

        );

        if(owned){

            button.disabled=true;

            button.classList.add(

            "owned"

            );

            button.innerText=

            "خرید شده";

        }

    });

}


/*══════════════════════════════════════
          SHOP LOADED
══════════════════════════════════════*/

window.addEventListener(

"load",

()=>{

    refreshOwnedItems();

});

console.log(

"%cShop Purchase Loaded",

"color:#00d4ff;font-weight:bold;"

);
/*══════════════════════════════════════
        TOOSHAN TREASURY V3
          PART 4 - SECTION 1
     INVENTORY LOAD + EQUIP SYSTEM
══════════════════════════════════════*/


/*══════════════════════════════════════
          LOAD INVENTORY
══════════════════════════════════════*/

export async function loadInventory(){

    if(!user) return;

    const {

        data,

        error

    } = await supabase

    .from("inventory")

    .select("*")

    .eq("user_id",user.id)

    .order("purchased_at",{

        ascending:false

    });

    if(error){

        console.error(error);

        showToast(

        "خطا در بارگذاری Inventory"

        );

        return;

    }

    inventory = data || [];

    refreshOwnedItems();

    refreshInventoryUI();

}


/*══════════════════════════════════════
        INVENTORY UI
══════════════════════════════════════*/

export function refreshInventoryUI(){

    const container =

    document.getElementById(

    "inventoryList"

    );

    if(!container) return;

    container.innerHTML="";

    inventory.forEach(item=>{

        const card=

        document.createElement(

        "div"

        );

        card.className=

        "inventory-card";

        card.innerHTML=`

        <h4>

        ${item.item_name}

        </h4>

        <small>

        ${item.category}

        </small>

        <button

        class="equip-item"

        data-id="${item.item_id}"

        >

        ${

        item.equipped

        ?

        "فعال"

        :

        "فعال‌سازی"

        }

        </button>

        `;

        container.appendChild(

        card

        );

    });

}


/*══════════════════════════════════════
            EQUIP ITEM
══════════════════════════════════════*/

export async function equipItem(

itemId

){

    if(!user) return;

    const current=

    inventory.find(

    item=>

    item.item_id===itemId

    );

    if(!current) return;

    await supabase

    .from("inventory")

    .update({

        equipped:false

    })

    .eq(

        "user_id",

        user.id

    )

    .eq(

        "category",

        current.category

    );

    const {

        error

    } = await supabase

    .from("inventory")

    .update({

        equipped:true

    })

    .eq(

        "user_id",

        user.id

    )

    .eq(

        "item_id",

        itemId

    );

    if(error){

        console.error(error);

        showToast(

        "خطا در فعال‌سازی"

        );

        return;

    }

    inventory.forEach(item=>{

        if(

        item.category===

        current.category

        ){

            item.equipped=false;

        }

    });

    current.equipped=true;

    refreshInventoryUI();

    showToast(

    "آیتم فعال شد"

    );

}


/*══════════════════════════════════════
        INVENTORY EVENTS
══════════════════════════════════════*/

document.addEventListener(

"click",

async e=>{

    const btn=

    e.target.closest(

    ".equip-item"

    );

    if(!btn) return;

    await equipItem(

    btn.dataset.id

    );

});


/*══════════════════════════════════════
      INVENTORY START
══════════════════════════════════════*/

window.addEventListener(

"load",

()=>{

    setTimeout(

        loadInventory,

        1200

    );

});


console.log(

"%cInventory Loaded",

"color:#00d4ff;font-weight:bold;"

);
/*══════════════════════════════════════
        TOOSHAN TREASURY V3
          PART 4 - SECTION 2
   DAILY REWARD + XP + COIN + MISSIONS
══════════════════════════════════════*/


/*══════════════════════════════════════
          DAILY REWARD
══════════════════════════════════════*/

export async function claimDailyReward(){

    if(!user) return;

    const today =

    new Date()

    .toISOString()

    .split("T")[0];

    const {

        data,

        error

    } = await supabase

    .from("profiles")

    .select("last_daily_reward")

    .eq("id",user.id)

    .single();

    if(error){

        console.error(error);

        return;

    }

    if(data.last_daily_reward===today){

        showToast(

        "جایزه امروز را قبلاً دریافت کرده‌ای."

        );

        return;

    }

    await addCoins(25);

    await addXP(15);

    await supabase

    .from("profiles")

    .update({

        last_daily_reward:today

    })

    .eq("id",user.id);

    createCoinBurst(

        document.body

    );

    addTransaction(

        "+25",

        "Daily Reward"

    );

    showToast(

    "جایزه روزانه دریافت شد."

    );

}


/*══════════════════════════════════════
          XP TO COINS
══════════════════════════════════════*/

const convertButton=

document.getElementById(

"convertCoins"

);

convertButton?.addEventListener(

"click",

async()=>{

    if(xp<50){

        showToast(

        "حداقل 50 XP نیاز داری."

        );

        return;

    }

    const ok=

    await removeXP(50);

    if(!ok) return;

    await addCoins(10);

    createCoinBurst(

    convertButton

    );

    addTransaction(

        "+10",

        "تبدیل XP"

    );

    showToast(

    "+10 Coin"

    );

});


/*══════════════════════════════════════
          MISSION REWARD
══════════════════════════════════════*/

export async function rewardMission(

coinsReward,

xpReward,

title

){

    if(coinsReward>0){

        await addCoins(

        coinsReward

        );

    }

    if(xpReward>0){

        await addXP(

        xpReward

        );

    }

    addTransaction(

        "+"+coinsReward,

        title

    );

    showToast(

    "ماموریت تکمیل شد."

    );

}


/*══════════════════════════════════════
         STORY REWARD
══════════════════════════════════════*/

export async function rewardStory(){

    await addStoryRead();

    await addXP(5);

}


/*══════════════════════════════════════
          LOGIN BONUS
══════════════════════════════════════*/

window.addEventListener(

"load",

()=>{

    setTimeout(

    claimDailyReward,

    2000

    );

});


console.log(

"%cReward System Loaded",

"color:#00d4ff;font-weight:bold;"

);
/*══════════════════════════════════════
        TOOSHAN TREASURY V3
          PART 5 - SECTION 1
     ACHIEVEMENT SYSTEM + NOTIFICATIONS
══════════════════════════════════════*/


/*══════════════════════════════════════
            ACHIEVEMENTS
══════════════════════════════════════*/

export let achievements=[];


/*══════════════════════════════════════
        LOAD ACHIEVEMENTS
══════════════════════════════════════*/

export async function loadAchievements(){

    if(!user) return;

    const {

        data,

        error

    } = await supabase

    .from("achievements")

    .select("*")

    .eq("user_id",user.id);

    if(error){

        console.error(error);

        return;

    }

    achievements=data||[];

    refreshAchievementUI();

}


/*══════════════════════════════════════
      ACHIEVEMENT UNLOCK
══════════════════════════════════════*/

export async function unlockAchievement(

achievementId,

title,

rewardCoins=0,

rewardXP=0

){

    if(

        achievements.some(

        item=>

        item.achievement_id===achievementId

        )

    ){

        return;

    }

    const {error}=

    await supabase

    .from("achievements")

    .insert({

        user_id:user.id,

        achievement_id:achievementId,

        title:title

    });

    if(error){

        console.error(error);

        return;

    }

    achievements.push({

        achievement_id:achievementId,

        title:title

    });

    if(rewardCoins>0){

        await addCoins(

        rewardCoins

        );

    }

    if(rewardXP>0){

        await addXP(

        rewardXP

        );

    }

    showNotification(

        "🏆 "+title

    );

    refreshAchievementUI();

}


/*══════════════════════════════════════
          ACHIEVEMENT UI
══════════════════════════════════════*/

export function refreshAchievementUI(){

    const container=

    document.getElementById(

    "achievementList"

    );

    if(!container) return;

    container.innerHTML="";

    achievements.forEach(item=>{

        const card=

        document.createElement(

        "div"

        );

        card.className=

        "achievement-card";

        card.innerHTML=`

        <h4>${item.title}</h4>

        <small>

        دریافت شد

        </small>

        `;

        container.appendChild(

        card

        );

    });

}


/*══════════════════════════════════════
            NOTIFICATION
══════════════════════════════════════*/

export function showNotification(

text

){

    const box=

    document.createElement(

    "div"

    );

    box.className=

    "notification";

    box.innerHTML=text;

    document.body.appendChild(

    box

    );

    setTimeout(()=>{

        box.classList.add(

        "show"

        );

    },50);

    setTimeout(()=>{

        box.classList.remove(

        "show"

        );

        setTimeout(()=>{

            box.remove();

        },300);

    },3500);

}


/*══════════════════════════════════════
          AUTO CHECK
══════════════════════════════════════*/

export async function checkAchievements(){

    if(

        storiesRead>=10

    ){

        await unlockAchievement(

        "reader_10",

        "۱۰ داستان خوانده شد",

        30,

        20

        );

    }

    if(

        coins>=1000

    ){

        await unlockAchievement(

        "rich_player",

        "ثروتمند",

        100,

        50

        );

    }

    if(

        inventory.length>=5

    ){

        await unlockAchievement(

        "collector",

        "کلکسیونر",

        50,

        30

        );

    }

}


/*══════════════════════════════════════
        START ACHIEVEMENTS
══════════════════════════════════════*/

window.addEventListener(

"load",

()=>{

    setTimeout(

        loadAchievements,

        1500

    );

});


console.log(

"%cAchievement System Loaded",

"color:#00d4ff;font-weight:bold;"

);
/*══════════════════════════════════════
        TOOSHAN TREASURY V3
          PART 5 - SECTION 2
      LEADERBOARD + CLOUD SYNC
══════════════════════════════════════*/


/*══════════════════════════════════════
          LEADERBOARD
══════════════════════════════════════*/

export let leaderboard=[];


/*══════════════════════════════════════
        LOAD LEADERBOARD
══════════════════════════════════════*/

export async function loadLeaderboard(){

    const {

        data,

        error

    } = await supabase

    .from("profiles")

    .select("username,level,coins,xp")

    .order("level",{

        ascending:false

    })

    .order("xp",{

        ascending:false

    })

    .limit(50);

    if(error){

        console.error(error);

        return;

    }

    leaderboard=data||[];

    refreshLeaderboardUI();

}


/*══════════════════════════════════════
       LEADERBOARD UI
══════════════════════════════════════*/

export function refreshLeaderboardUI(){

    const container=

    document.getElementById(

    "leaderboardList"

    );

    if(!container) return;

    container.innerHTML="";

    leaderboard.forEach((player,index)=>{

        const row=

        document.createElement(

        "div"

        );

        row.className=

        "leaderboard-row";

        row.innerHTML=`

        <span>

        #${index+1}

        </span>

        <strong>

        ${player.username}

        </strong>

        <small>

        Lv.${player.level}

        </small>

        <b>

        ${Number(player.coins).toLocaleString()} 🪙

        </b>

        `;

        container.appendChild(row);

    });

}


/*══════════════════════════════════════
         CLOUD SYNC
══════════════════════════════════════*/

export async function syncAll(){

    await saveProfile();

    await loadInventory();

    await loadAchievements();

    await loadLeaderboard();

}


/*══════════════════════════════════════
          AUTO SYNC
══════════════════════════════════════*/

setInterval(

async()=>{

    if(!user) return;

    await syncAll();

},

60000

);


/*══════════════════════════════════════
        PROFILE CHANGED
══════════════════════════════════════*/

export async function profileUpdated(){

    updateUI();

    refreshInventoryUI();

    refreshAchievementUI();

    refreshLeaderboardUI();

}


/*══════════════════════════════════════
       CHECK EVERYTHING
══════════════════════════════════════*/

export async function refreshGame(){

    await refreshProfile();

    await loadInventory();

    await loadAchievements();

    await checkAchievements();

    await loadLeaderboard();

    profileUpdated();

}


/*══════════════════════════════════════
           PAGE START
══════════════════════════════════════*/

window.addEventListener(

"load",

()=>{

    setTimeout(

    refreshGame,

    1500

    );

});


/*══════════════════════════════════════
           SYSTEM READY
══════════════════════════════════════*/

console.log(

"%cTOOSHAN TREASURY V3 READY",

"color:#19a7ff;font-size:18px;font-weight:bold;"

);
