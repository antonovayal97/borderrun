window.BACKEND_URL = "http://localhost/";

document.addEventListener("DOMContentLoaded", (event) => {
    const html = document.querySelector("html");
    const mainButton = Telegram.WebApp.MainButton;
    const backButton = Telegram.WebApp.BackButton;
    let headerTitle = document.querySelector(".header-title");
    let citys = [
        {
            id: 1,
            name: "Паттайя",
            img: "https://www.fodors.com/wp-content/uploads/2024/03/0-HERO-Shutterstock-1111917086.jpg",
            price: "от 2900 бат",
            stamps: [
                {
                    id: 1,
                    name: "30 дней",
                    price: "2900 бат",
                },
                {
                    id: 2,
                    name: "60 дней",
                    price: "3100 бат",
                }
            ]
        },
        {
            id: 2,
            name: "Бангкок",
            img: "https://static.independent.co.uk/2025/01/03/14/newFile-12.jpg",
            price: "от 2900 бат",
            stamps: [
                {
                    id: 1,
                    name: "30 дней",
                    price: "2900 бат",
                },
                {
                    id: 2,
                    name: "60 дней",
                    price: "3100 бат",
                }
            ]
        }
    ];
    let activeCity = null;
    let stamps = null;
    let currentStage = 0;
    const totalStages = 9;

    const stagesObjects = [
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

    function initCitys()
    {
        let cityList = document.querySelector(".city-list");

        citys.forEach((city) => {
            // Создаем элемент div
            let cityCard = document.createElement("div");
            // Добавляем классы и HTML-содержимое
            cityCard.dataset.id = city.id;
            cityCard.className = "city-card flex items-center p-2 rounded-2xl bg-gray-100";
            cityCard.innerHTML = `
                <div class="w-28 h-16 rounded-lg overflow-hidden">
                    <img class="w-full h-full object-cover" src="${city.img}" alt="${city.name}">
                </div>
                <div class="font-semibold text-xl ml-5">${city.name}</div>
                <div class="font-semibold text-m ml-auto mr-4">${city.price}</div>
            `;

            cityCard.addEventListener("click",() => {
                updateCity(cityCard)
            })
            // Добавляем созданный элемент в список
            cityList.appendChild(cityCard);
        });
    }

    function updateCity(noda)
    {
        if(activeCity == noda.dataset.id)
        {
            return
        }
        activeCity = (noda.dataset.id != undefined) ? noda.dataset.id : null;
        if(activeCity)
        {
            let cards = document.querySelectorAll(".city-card");
            cards.forEach((card) => {
                card.classList.remove("active");
            })
            noda.classList.add("active");
        }
        if(activeCity == null)
        {
            mainButton
            .disable()
            .hide()
        }
    }

    function changeStage(newStage) {
        if (isAnimating) return;
        isAnimating = true;

        const prevStage = currentStage;
        currentStage = Math.max(0, Math.min(newStage, totalStages - 1));

        const prevElement = document.querySelector(`.stage_${prevStage}`);
        const currentElement = document.querySelector(`.stage_${currentStage}`);

        if(currentStage == 2 && activeCity == null)
        {
            mainButton
            .disable()
            .hide()
        }
        else
        {
            mainButton
            .enable()
            .show()
        }
        // Анимация перехода
        //prevElement.classList.add('fade-out');
        //currentElement.classList.add('fade-in');

        setTimeout(() => {
            prevElement.style.display = 'none';
            //prevElement.classList.remove('fade-out');
            
            currentElement.style.display = 'block';
            //currentElement.classList.remove('fade-in');
            
            updateUI();
            isAnimating = false;
        }, 100);
    }

    function updateUI() {
        // Обновление BackButton
        backButton[currentStage > 0 ? 'show' : 'hide']();

        if(stagesObjects[currentStage].title != "")
        {
            headerTitle.innerText = stagesObjects[currentStage].title;
        }
        else
        {
            headerTitle.innerText = "";
        }
        // Обновление MainButton
        mainButton
            .setText(stagesObjects[currentStage].button)
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
        initCitys();
        //checkTheme();
    }

    init();
});