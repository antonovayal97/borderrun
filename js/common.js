window.BACKEND_URL = "http://localhost/";

document.addEventListener("DOMContentLoaded", (event) => {
    const html = document.querySelector("html");
    const mainButton = Telegram.WebApp.MainButton;
    const backButton = Telegram.WebApp.BackButton;
    let headerTitle = document.querySelector(".header-title");

    var dataForSend = {
        description: {
            telegram_name: null,
            telegram_id: null,
            city: null,
            stamp: null,
            date: null,
            place: null
        },
        order_code: null
    };

    
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
                    order_code: "PATTAYA_30"
                },
                {
                    id: 2,
                    name: "60 дней",
                    price: "3100 бат",
                    order_code: "PATTAYA_60"
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
                    order_code: "BANGKOK_30"
                },
                {
                    id: 2,
                    name: "60 дней",
                    price: "3100 бат",
                    order_code: "BANGKOK_60"
                }
            ]
        }
    ];
    let activeCity = null;
    let activeStamp = null;
    let activeDate = null;
    let activeAddress = null;
    let currentStage = 0;
    const totalStages = 9;
    let stageNum = 0;
    let successAnimation;
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
                updateCity(cityCard,city)
            })
            // Добавляем созданный элемент в список
            cityList.appendChild(cityCard);
        });
    }

    function updateCity(noda,city)
    {
        if(activeCity == noda.dataset.id)
        {
            return
        }
        activeCity = (noda.dataset.id != undefined) ? noda.dataset.id : null;
        if(activeCity)
        {
            dataForSend.description.city = city.name;

            let cards = document.querySelectorAll(".city-card");
            cards.forEach((card) => {
                card.classList.remove("active");
            })
            noda.classList.add("active");
            initStamps(activeCity);
            activeStamp = null;

            dataForSend.description.stamp = null;
            dataForSend.order_code = null;

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
                updateStamp(stampCard, stamp)
            })
            // Добавляем созданный элемент в список
            stampList.appendChild(stampCard);
        })
    }
    function updateStamp(noda, stamp)
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

            dataForSend.description.stamp = stamp.name;

            dataForSend.order_code = stamp.order_code;

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
            //flatpickrInstance.close();  
        }

        const prevStage = currentStage;
        currentStage = Math.max(0, Math.min(newStage, totalStages - 1));

        const prevElement = document.querySelector(`.stage_${prevStage}`);
        const currentElement = document.querySelector(`.stage_${currentStage}`);

        if
        (
            currentStage == 2 && activeCity == null || 
            currentStage == 3 && activeStamp == null ||
            currentStage == 4 && activeDate == null ||
            currentStage == 5 && activeAddress == null
        )
        {
            mainButton
            .disable()
            .hide()
        }
        else if(currentStage == 6)
        {
            mainButton
            .disable()
            .hide()

            // Отправляем POST-запрос
            fetch('https://24asia-service.ru/api/create_payment.php', {
                method: 'POST', // Метод запроса
                headers: {
                    'Content-Type': 'application/json' // Указываем, что отправляем JSON
                },
                body: JSON.stringify(dataForSend) // Преобразуем объект в JSON-строку
            })
            .then(response => response.json()) // Получаем ответ от сервера как текст
            .then(result => {
                if(result.status_code != 1)
                {
                    return false
                }
                const checkout = new window.YooMoneyCheckoutWidget({
                    confirmation_token: result.token, //Токен, который перед проведением оплаты нужно получить от ЮKassa
                    return_url: 'https://example.com/', //Ссылка на страницу завершения оплаты, это может быть любая ваша страница
            
                    //При необходимости можно изменить цвета виджета, подробные настройки см. в документации
                    customization: {
                    //Настройка цветовой схемы, минимум один параметр, значения цветов в HEX
                    colors: {
                        //Цвет акцентных элементов: кнопка Заплатить, выбранные переключатели, опции и текстовые поля
                        control_primary: (Telegram.WebApp.themeParams.button_color) ? Telegram.WebApp.themeParams.button_color : "#00BF96", //Значение цвета в HEX
                        control_primary_content: (Telegram.WebApp.themeParams.button_text_color) ? Telegram.WebApp.themeParams.button_text_color : "#FFFFFF",
                        //Цвет платежной формы и ее элементов
                        background: Telegram.WebApp.colorScheme === "light" ? "#FFFFFF" : "#1D232A" //Значение цвета в HEX
                    }
                    },
                    error_callback: function(error) {
                        console.log(error)
                    }
                });
            
                //Отображение платежной формы в контейнере
                checkout.render('payment-form');
            })
            .catch(error => {
                console.error('Ошибка:', error); // Обрабатываем ошибки
            });

        }
        else if(currentStage == 7)
        {
            successAnimation.play()
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
                activeDate = dateStr;
                dataForSend.description.date = activeDate;
                mainButton
                .enable()
                .show()
            }
          });
    }
    function initAddress()
    {
        const input = document.querySelector(".address input");
        input.addEventListener("input", () => {
            updateAddress(input);
        })
    }
    function updateAddress(input)
    {
        activeAddress = (input.value.length > 0) ? input.value : null;
        if(activeAddress)
        {
            mainButton
            .enable()
            .show()
        }
        else
        {
            mainButton
            .disable()
            .hide()
        }

        dataForSend.description.place = activeAddress;
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

    function initFix()
    {
        document.addEventListener('click', (event) => {
            const tags = ['INPUT', 'TEXTAREA']
            const focused = document.activeElement
            console.log(focused.tagName)
            if (focused && focused !== event.target && tags.includes(focused.tagName)) {
              focused.blur()
            }
          })
    }
    function initTelegramWebApp() {
        Telegram.WebApp.ready();
        
        const user = Telegram.WebApp.initDataUnsafe?.user;

        if (user) {
            dataForSend.description.telegram_name = user?.username || null;
            dataForSend.description.telegram_id = user?.id || null;
            document.querySelector("h1").innerText = "user_name: " + dataForSend.description.telegram_name + ", telegram_id: " + dataForSend.description.telegram_id
        } else {
            document.querySelector("h1").innerText = "User data is not available.";
        }
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
    function initLottie()
    {
        var success = document.querySelector("#successLottie");
        successAnimation = lottie.loadAnimation({
            container: success, // Контейнер для анимации
            renderer: 'svg', // Формат рендеринга (svg, canvas, html)
            loop: false, // Зациклить анимацию
            autoplay: false, // Автоматическое воспроизведение
            path: '../img/success.json' // Путь к файлу .lottie
        });
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
        initFix();
        initDate();
        initAddress();
        initLottie();
    }

    init();
});