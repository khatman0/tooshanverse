/*══════════════════════════════════════
        ADMIN LINK VISIBILITY CHECK
   این فایل در تمام صفحاتی که side-nav
   دارند import می‌شود تا در صورت ادمین
   بودن کاربر، لینک پنل مدیریت نمایش
   داده شود.
══════════════════════════════════════*/

export async function checkAdminLink(supabase){

    const adminLink = document.getElementById("adminPanelLink");

    if(!adminLink) return;

    const {

        data:{ user }

    } = await supabase.auth.getUser();

    if(!user) return;

    const {

        data,

        error

    } = await supabase

    .from("profiles")

    .select("is_admin")

    .eq("id", user.id)

    .single();

    if(error){

        console.error(error);

        return;

    }

    if(data?.is_admin){

        adminLink.style.display = "flex";

    }

}
