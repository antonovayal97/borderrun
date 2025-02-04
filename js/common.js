window.BACKEND_URL = "http://localhost/";

document.addEventListener("DOMContentLoaded",(event) => {
    const html = document.querySelector("html");
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
            Telegram.WebApp.MainButton
                .hide();
        };

        // Инициализация при загрузке
        initMainButton();
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
