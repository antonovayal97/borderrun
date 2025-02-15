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
                    price: "1111 бат",
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
                    price: "2222 бат",
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
    let activeStamp = null;
    let stamps = null;
    let currentStage = 0;
    const totalStages = 9;
    let stageNum = 0;

    let flatpickrInstance;

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
            title: "Выберите дату поездки",
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
    document.addEventListener('keydown', (event) => {
        // Проверяем, что нажат пробел И фокус не в поле ввода/текстовой области
        if (event.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
            event.preventDefault(); // Отменяем стандартное действие (опционально)
            changeStage(stageNum);
            stageNum++;
        }
    });
    function initCitys()
    {
        let cityList = document.querySelector(".city-list");

        citys.forEach((city) => {
            // Создаем элемент div
            let cityCard = document.createElement("div");
            // Добавляем классы и HTML-содержимое
            cityCard.dataset.id = city.id;
            cityCard.className = "city-card flex items-center p-2 rounded-2xl bg-base-200";
            cityCard.innerHTML = `
                <div class="w-28 h-16 rounded-lg overflow-hidden">
                    <img class="w-full h-full object-cover" src="${city.img}" alt="${city.name}">
                </div>
                <div class="font-semibold text-lg ml-5">${city.name}</div>
                <div class="font-semibold text-xs ml-auto mr-4">${city.price}</div>
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
            initStamps(activeCity);
            activeStamp = null
            mainButton
            .enable()
            .show()
        }
    }

    function initStamps(cityId)
    {
        let stampList = document.querySelector(".stamp-list");
        let stamps = citys[cityId - 1].stamps;
        stampList.innerHTML = null;
        stamps.forEach((stamp) => {
            let stampCard = document.createElement("div");
            stampCard.dataset.id = stamp.id;
            stampCard.className = "stamp-card flex-1 flex flex-col items-center p-2 py-8 rounded-2xl bg-base-200";
            stampCard.innerHTML = `
                <div class="font-semibold text-xl">${stamp.name}</div>
                <div class="font-semibold text-base">${stamp.price}</div>
            `;

            stampCard.addEventListener("click",() => {
                updateStamp(stampCard)
            })
            // Добавляем созданный элемент в список
            stampList.appendChild(stampCard);
        })
    }
    function updateStamp(noda)
    {
        if(activeStamp == noda.dataset.id)
        {
            return
        }
        activeStamp = (noda.dataset.id != undefined) ? noda.dataset.id : null;
        if(activeStamp)
        {
            let cards = document.querySelectorAll(".stamp-card");
            cards.forEach((card) => {
                card.classList.remove("active");
            })
            noda.classList.add("active");

            mainButton
            .enable()
            .show()
        }
    }
    function changeStage(newStage) {
        if (isAnimating) return;
        isAnimating = true;

        if(newStage != 0)
        {
            flatpickrInstance.close();  
        }

        const prevStage = currentStage;
        currentStage = Math.max(0, Math.min(newStage, totalStages - 1));

        const prevElement = document.querySelector(`.stage_${prevStage}`);
        const currentElement = document.querySelector(`.stage_${currentStage}`);

        if(currentStage == 2 && activeCity == null || currentStage == 3 && activeStamp == null)
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
        setTimeout(() => {
            prevElement.style.display = 'none';
            currentElement.style.display = 'block';
            updateUI();
            isAnimating = false;
        }, 100);
    }
    function initDate()
    {
        const dateInput = document.querySelector('.date-pick__element');

        const now = new Date();
        const currentHour = now.getHours();

        // Если текущее время больше 12:00, блокируем текущий день и следующий день
        const minDate = currentHour >= 12 ? new Date(now.setDate(now.getDate() + 2)) : new Date(now.setDate(now.getDate() + 1));

        flatpickrInstance = flatpickr(dateInput, {
            minDate: minDate,
            disableMobile: "true",
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "d.m.Y", // Формат даты: ДД.ММ.ГГГГ
            locale: "ru", // Локализация на русский
            onChange: function(selectedDates, dateStr) {
              // Выводим выбранную дату
              //selectedDateText.textContent = `Выбранная дата: ${dateStr}`;
      
              // Меняем текст кнопки
              //dateButton.textContent = "Поменять дату";
            }
          });
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

        changeStage(stageNum);
    }

    function checkTheme() {
        const theme = Telegram.WebApp.colorScheme === "light" ? "light" : "dark";
        html.dataset.theme = theme;
        //html.dataset.theme = "dark";
        document.querySelectorAll(".theme-controller").forEach(controller => {
            controller.value = theme === "light" ? "dark" : "light";
        });
    }

    function init() {
        initTelegramWebApp();
        initCitys();
        checkTheme();
        initDate();
    }

    init();
});