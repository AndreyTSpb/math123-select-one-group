<?php
/**
 * Plugin Name: Math123 Select One Group
 * Description: WordPress плагин для вызова модалки с выбором групп. Шорт-код для создание кнопки [math123_btn_rec_to_group subject=1]record[/math123_btn_rec_to_group] в качестве параметров можно передавать subject. Обращается AJAX`ом в бд для получения данных о площадке
 * Plugin URI: https://
 * Author: Andrey Tynyany
 * Version: 1.0.1
 * Author URI: http://tynyany.ru
 *
 * Text Domain: Math123 Select One Group
 *
 * @package Math123 Select One Group
 */

defined('ABSPATH') or die('No script kiddies please!');

define( 'WPM123SOG_VERSION', '1.0.1' );

define( 'WPM123SOG_REQUIRED_WP_VERSION', '5.5' );

define( 'WPM123SOG_PLUGIN', __FILE__ );

define( 'WPM123SOG_PLUGIN_BASENAME', plugin_basename( WPM123SOG_PLUGIN ) );

define( 'WPM123SOG_PLUGIN_NAME', trim( dirname( WPM123SOG_PLUGIN_BASENAME ), '/' ) );

define( 'WPM123SOG_PLUGIN_DIR', untrailingslashit( dirname( WPM123SOG_PLUGIN ) ) );

define( 'WPM123SOG_PLUGIN_URL',
    untrailingslashit( plugins_url( '', WPM123SOG_PLUGIN ) )
);

/**
 *  Переменная куда помещать данные полученые через аякс
 */
$group_select_data = array();

add_shortcode('math123_btn_rec_to_group','math123_btn_rec_to_group');

/**
 * Основная функция, к котоой привязывается шорткод
 */
function math123_btn_rec_to_group($atts, $content){
    /**
     * Подключили скрипт для обработки
     */
    add_action('wp_footer', 'math123_select_one_group_script');

    global $group_select_data;

    /**
     * урл страници с обработкой запроса
     */
    $group_select_data['action_url'] = 'https://user.math123.ru/groupsales';

    if(isset($atts['subject']) AND !empty($atts['subject'])){
        $group_select_data['subject'] = $atts['subject'];
    }else{
        $group_select_data['subject'] = 1;
    }
    //добавление названия кнопки
    if(isset($content) and !empty($content)){
        $group_select_data['title'] = $content;
    }else{
        $group_select_data['title'] = 'Отправить';
    }
    //Идетнификатор формы генерим
    $group_select_data['key_btn'] = 'btn_'.$atts['subject'].'_'.rand(1000,9999);

    //цвет формы взависимости от педмета
    $group_select_data['color'] = math123_colors_bg_modal($atts['subject']);
    /**
     * Заполним данные для формирования блоков, полученные через AJAX
     */

    $html = "";
    /**
     * Получим буфиризованый вывод шаблона
     */
    $html = math123_select_one_group_html();
    return $html;
}

/**
 * Цвет для модалки
 * Цвета окошек по идее соответствуют предмету:
 * Математика - розовый
 * Физика - бирюзовый
 * Прога - оранжевый
 * Бизнес - темно синий
 */
function math123_colors_bg_modal($subject){
    $color = 'purple';
    if($subject == 1){
        $color = 'purple';
    }elseif($subject == 3){
        $color = 'green';
    }elseif ($color == 5){
        $color = 'yellow';
    }else{
        $color = 'grey';
    }
    return $color;
}
/**
 * Размещение данных в шаблоне
 */
function math123_select_one_group_html(){
    global $group_select_data;
    $data = $group_select_data;
    ob_start();
    include WPM123SOG_PLUGIN_DIR."/templates/modal.php";
    $html = ob_get_contents();
    ob_end_clean();
    return $html;
}

function math123_select_one_group_script(){
    //code
    global $progress_data;
    $js_data =$progress_data['subject'];
    /**
     * регистрация скриптов
     */
    wp_register_script('math123SelectOneGroupScript', plugins_url( 'assets/js/script.js', __FILE__ ));
    /**
     * подключение скриптов
     */
    //wp_enqueue_script('yandexMapScript');
    wp_enqueue_script('math123SelectOneGroupScript');
    /**
     * Параматры для скрипта
     */
    wp_localize_script( 'math123OurProgressScript', 'Obj', $js_data );
}