<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
    die(); ?>

<!DOCTYPE html>
<html lang="ru" data-theme="light">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="initial-scale=1.0, width=device-width, user-scalable=no">
        <meta name="robots" content="noindex,nofollow">
        <title><? $APPLICATION->ShowTitle() ?></title>
        <!--<script src="https://unpkg.com/htmx.org"></script>-->
        <script src="https://telegram.org/js/telegram-web-app.js?56"></script>
        <?
        if($APPLICATION->GetCurDir() == "/app/"):
        ?>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.2.3/flatpickr.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.2.3/flatpickr.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ru.js"></script>
        <script src="https://yookassa.ru/checkout-widget/v1/checkout-widget.js"></script>
        <?
        endif;
        ?>
        <?
        if($APPLICATION->GetCurDir() == "/success_page/"):
        ?>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.10.1/lottie.min.js"></script>
        <?
        endif;
        ?>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="<?=SITE_TEMPLATE_PATH?>/css/main.css?<?=time()?>">
    </head>
    <body class="text-base">
        <header class="container mx-auto py-4 px-4">
            <h2 class="header-title font-semibold text-2xl"></h2>
        </header>
        <main class="px-4 mb-14 container mx-auto">