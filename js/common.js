window.BACKEND_URL = "http://localhost/";

document.addEventListener("DOMContentLoaded",(event) => {
    const html = document.querySelector("html");
    const mainButton = Telegram.WebApp.MainButton;
    const backButton = Telegram.WebApp.BackButton;
    let currentStage = 0; // Текущий этап
const totalStages = 9; // Общее количество этапов

function changeStage(newStage) {
    const prevStage = currentStage;
    currentStage = newStage;

    // Скрываем предыдущий этап
    document.querySelector(`.stage_${prevStage}`).style.display = 'none';
    // Показываем текущий этап
    document.querySelector(`.stage_${currentStage}`).style.display = 'block';

    // Управление кнопкой "Назад"
    backButton[currentStage > 0 ? 'show' : 'hide']();

    // Обновление основной кнопки
    updateMainButton();
}

function updateMainButton() {

    
    if(currentStage === totalStages - 1) {
        mainButton.setText("Завершить")
            .onClick(() => {
                //console.log("finish")//Telegram.WebApp.sendData(JSON.stringify({action: 'finish'}));
            })
            .show();
        } else {
            mainButton.setText("Далее")
                .onClick(() => changeStage(currentStage + 1))
                .show();
        }
    }

    function initTelegramWebApp() {
        Telegram.WebApp.ready();
        
        // Инициализация кнопки "Назад"
        backButton
            .onClick(() => changeStage(currentStage - 1))
            .hide();

        // Первоначальная настройка
        changeStage(0); // Показываем первый этап
        updateMainButton();
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
