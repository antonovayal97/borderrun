window.BACKEND_URL = "http://localhost/";

document.addEventListener("DOMContentLoaded",(event) => {
    const html = document.querySelector("html");
    var current_stage = 0;
    var prev_stage = 0;
    function change_stage()
    {
        let prev_stage_page = document.querySelector(".stage_" + prev_stage);
        let current_stage_page = document.querySelector(".stage_" + current_stage);
        prev_stage_page.style = null;
        current_stage_page.style.display = "block";

        if(current_stage > 0)
        {
            Telegram.WebApp.BackButton
                .show()
        }
        else
        {
            Telegram.WebApp.BackButton
                .hide()
        }
        if(prev_stage - current_stage == -1) // вперед
        {

        }
        else // назад
        {

        }
    }

    function initTelegramWebApp()
    {
        //let telegramTest = document.querySelector("#telegramTest");
        //telegramTest.innerText = JSON.stringify(window.Telegram.WebApp.initData, null, 4);

        // Инициализация WebApp
        Telegram.WebApp.ready();

        // Конфигурация кнопки
        const initMainButton = () => {
            Telegram.WebApp.MainButton
                .setText("Подтвердить")
                .setParams({
                    color: Telegram.WebApp.themeParams.button_color,
                    text_color: Telegram.WebApp.themeParams.button_text_color
                })
                .onClick(handleMainButtonClick)
                .enable()
                .show();
        };

        // Обработчик клика
        const handleMainButtonClick = () => {
            current_stage++;
            if(current_stage - prev_stage > 1)
            {
                prev_stage++;
            }
            change_stage();
            //Telegram.WebApp.MainButton
            //    .hide();
        };


        const initBackButton = () => {
            Telegram.WebApp.BackButton
                .onClick(handleBackButtonClick)
        };

        // Обработчик клика
        const handleBackButtonClick = () => {
            current_stage--
            if(prev_stage - current_stage > 1)
            {
                prev_stage--;
            }

            change_stage();
        };
        // Инициализация при загрузке
        initMainButton();
        initBackButton();
    }
    function checkTheme()
    {
        var theme_controllers = document.querySelectorAll(".theme-controller");
        if(window.Telegram.WebApp.colorScheme == "light")
        {
            html.dataset.theme = "light";
            theme_controllers.forEach((controller) => {
                controller.value = "dark";
            })
            return;
        }
        html.dataset.theme = "dark";
        theme_controllers.forEach((controller) => {
            controller.value = "light";
        })
    }
    function init()
    {
        initTelegramWebApp();
        checkTheme();
    }
    init();
});
