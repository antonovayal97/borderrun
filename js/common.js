window.BACKEND_URL = "http://localhost/";

document.addEventListener("DOMContentLoaded", async (event) => {
    const html = document.querySelector("html");

    const mainButton = Telegram.WebApp.MainButton;
    const backButton = Telegram.WebApp.BackButton;

    let headerTitle = document.querySelector(".header-title");

    const addressInput = document.querySelector(".addressInput");
    const phoneInput = document.querySelector(".phoneInput");
    var isWhatsapp = document.querySelector(".isWhatsapp");


    var dataForSend = {
        description: {
            telegram_name: null,
            telegram_id: null,
            city: null,
            date: null,
            place: null,
            phone: null,
            isWhatsapp: null
        },
        order_code: null
    };
    
    async function getCities() {
        try {
            const response = await fetch('https://24asia-service.ru/api/get_cities.php');
            const data = await response.json();
            
            if(data.status === 'success') {
                // Преобразование данных для использования в приложении
                const cities = data.data.map(city => ({
                    id: city.id,
                    name: city.name,
                    img: city.img,
                    price: `${city.price} бат`,
                    description: city.description
                }));
                
                console.log('Обновленные данные:', cities);
                return cities;
            }
        } catch(error) {
            console.error('Ошибка при загрузке данных:', error);
            return [];
        }
    }
    let citys;
    // Использование
    await getCities().then(cities => {
        // Ваша логика работы с данными
        citys = cities; // Обновленный массив
        console.log(citys)
    });

    let activeCity = null;
    let activeDate = null;
    let activeAddress = null;
    let currentStage = 0;
    const totalStages = 7;
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
            title: "Описание",
            button: "Продолжить"
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
            stageNum++;
            changeStage(stageNum);
        }

        if (event.altKey && !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
            event.preventDefault(); // Отменяем стандартное действие (опционально)
            if(stageNum != 0 )
            {
                stageNum--;
            }
            changeStage(stageNum);
            
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
            cityCard.className = "city-card flex items-center p-2 rounded-2xl bg-base-200 cursor-pointer";
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
            var description = document.querySelector(".city_description");


            dataForSend.description.city = city.name;

            let cards = document.querySelectorAll(".city-card");
            cards.forEach((card) => {
                card.classList.remove("active");
            })
            noda.classList.add("active");

            dataForSend.order_code = activeCity;

            description.innerHTML = citys.find(city => city.id == activeCity).description;

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

            initPayments();
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


    function initPayments()
    {
        document.querySelector("#payment-form").innerHTML = "";
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
                return_url: 'https://24asia-service.ru/success_page/', //Ссылка на страницу завершения оплаты, это может быть любая ваша страница

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

        addressInput.addEventListener("input", function() {
            // Сохраняем позицию курсора
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            // Удаляем все символы, кроме латинских букв, цифр, пробелов, точек, запятых и дефисов
            this.value = this.value.replace(/[^a-zA-Z0-9\s.,-]/g, '');
            
            // Корректируем позицию курсора после изменения значения
            const newLength = this.value.length;
            const newStart = Math.min(start, newLength);
            const newEnd = Math.min(end, newLength);
            this.setSelectionRange(newStart, newEnd);
            
            updateAddress();
        });

        phoneInput.addEventListener("input", function() {
            updateAddress();
        });

        isWhatsapp.addEventListener("input", function() {
            updateAddress();
        });

        var inputPhoneMask = IMask(phoneInput, {
            mask: [ {
                mask: "+000-0000-0000",
                startsWith: "66",
                lazy: false,
                country: "Таиланд",
            }, {
                mask: "+0 (000) 000-00-00",
                startsWith: "7",
                lazy: false,
                country: "Russia",
            }, {
                mask: "0000000000000",
                startsWith: "",
                country: "Страна не определена",
            }, ],
            dispatch: (appended, dynamicMasked) => {
                const number = (dynamicMasked.value + appended).replace(/\D/g, "");
                return dynamicMasked.compiledMasks.find( (m) => number.indexOf(m.startsWith) === 0);
            }
        });
    }


    function updateAddress()
    {
        activeAddress = (addressInput.value.length > 0) ? addressInput.value : null;

        if(activeAddress && phoneInput.value.length > 7)
        {
            mainButton
            .enable()
            .show()

            console.log("Адрес и номер телефона")
        }
        else
        {
            mainButton
            .disable()
            .hide()
        }

        dataForSend.description.place = activeAddress;
        dataForSend.description.phone = phoneInput.value;
        dataForSend.description.isWhatsapp = isWhatsapp.value;

        console.log("dataForSend", dataForSend);
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
        //changeStage(5);
    }
    function checkTheme() {
        const theme = Telegram.WebApp.colorScheme === "light" ? "light" : "dark";
        html.dataset.theme = theme;
        //html.dataset.theme = "dark";
        document.querySelectorAll(".theme-controller").forEach(controller => {
            controller.value = theme === "light" ? "dark" : "light";
        });
    }
    function initChat()
    {
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/67d0a1e2d19d93190e0b6020/1im3fgncr';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
        })();
    }
    function init() {
        initTelegramWebApp();
        initCitys();
        checkTheme();
        initFix();
        initDate();
        initAddress();
        initChat();
    }

    init();
});