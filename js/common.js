window.BACKEND_URL = "http://localhost/";

document.addEventListener("DOMContentLoaded", (event) => {
    const html = document.querySelector("html");
    const mainButton = Telegram.WebApp.MainButton;
    const backButton = Telegram.WebApp.BackButton;
    let headerTitle = document.querySelector(".header-title");
    let currentStage = 0;
    const totalStages = 9;

    const buttonStages = [
        {
            title: "",
            button: "Начать"
        },
        {
            title: "Описание услуги",
            button: "Продолжить"
        },
        {
            title: "Выберите город",
            button: "Выбрать"
        },
        {
            title: "Срок штампа",
            button: "Выбрать"
        },
        {
            title: "Выберите дату бордера",
            button: "Выбрать"
        },
        {
            title: "Откуда будете выезжать",
            button: "Выбрать"
        },
        {
            title: "Оплата",
            button: "Оплатить"
        },
        {
            title: "",
            button: "Продолжить"
        },
        {
            title: "Мои бордеры",
            button: "Новая заявка"
        }
    ];
    // Флаг для блокировки анимации
    let isAnimating = false;

    // Единый обработчик для MainButton
    const handleMainButtonClick = () => {
        if (currentStage === totalStages - 1) {
            Telegram.WebApp.sendData(JSON.stringify({action: 'finish'}));
        } else {
            changeStage(currentStage + 1);
        }
    };

    function changeStage(newStage) {
        if (isAnimating) return;
        isAnimating = true;

        const prevStage = currentStage;
        currentStage = Math.max(0, Math.min(newStage, totalStages - 1));

        const prevElement = document.querySelector(`.stage_${prevStage}`);
        const currentElement = document.querySelector(`.stage_${currentStage}`);

        // Анимация перехода
        prevElement.classList.add('fade-out');
        currentElement.classList.add('fade-in');

        setTimeout(() => {
            prevElement.style.display = 'none';
            prevElement.classList.remove('fade-out');
            
            currentElement.style.display = 'block';
            currentElement.classList.remove('fade-in');
            
            updateUI();
            isAnimating = false;
        }, 300);
    }

    function updateUI() {
        // Обновление BackButton
        backButton[currentStage > 0 ? 'show' : 'hide']();

        if(buttonStages[currentStage].title != "")
        {
            headerTitle.innerText = buttonStages[currentStage].title;
        }
        else
        {
            headerTitle.innerText = "";
        }
        // Обновление MainButton
        mainButton
            .setText(buttonStages[currentStage].button)
            .offClick(handleMainButtonClick) // Важно: удаляем предыдущий обработчик
            .onClick(handleMainButtonClick);

        if (currentStage === totalStages - 1) {
            mainButton.setParams({color: '#32a852'});
        } else {
            mainButton.setParams({color: Telegram.WebApp.themeParams.button_color});
        }
    }

    function initTelegramWebApp() {
        Telegram.WebApp.ready();
        
        backButton
            .onClick(() => changeStage(currentStage - 1))
            .hide();

        mainButton
            .setParams({
                color: Telegram.WebApp.themeParams.button_color,
                text_color: Telegram.WebApp.themeParams.button_text_color
            })
            .show();

        changeStage(0);
    }

    function checkTheme() {
        const theme = Telegram.WebApp.colorScheme === "light" ? "light" : "dark";
        html.dataset.theme = theme;
        document.querySelectorAll(".theme-controller").forEach(controller => {
            controller.value = theme === "light" ? "dark" : "light";
        });
    }

    function init() {
        initTelegramWebApp();
        checkTheme();
    }

    init();
});