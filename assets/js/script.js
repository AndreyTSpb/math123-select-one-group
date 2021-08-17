document.addEventListener('DOMContentLoaded', function() {
    var modal,
        id_modal,
        baseUrl = 'https://user.math123.ru/',
        id_for_inputs,
        id_subject,
        id_class,
        id_type,
        id_location,
        id_user,
        id_stud,
        stud_klass;
    /**
     * jQuery(function($) {}); добавлено для избежания конфликта
     */
    jQuery(function ($) {
        /**
         * Последовательность выбора
         * 1) Тип группы
         * 2) Площадка
         * 3) Класс
         * 4) День занятий
         */
        /**
         * заполняем данные формы для записи
         */
        $('.btn-record-to-groups').on('click', function () {
            //получаем идентификатор модалки
            id_modal = $(this).attr('data-bs-target');
            //ищем модалку с нужным идентификатором
            modal = document.querySelector(id_modal);

            if(modal !== null){
                /**
                 * Заполнить данные об ученике и родиетели если есть
                 */
                get_data_user();

                /**
                 * заполняем список площадок
                 */
                //select_location(modal);

                /**
                 * слушатель на кнопку закрытие
                 */
                let btn_close = modal.querySelector('.btn-close');
                btn_close.addEventListener('click', function () {
                    clear_form(modal);
                });
            }

        });

        /**
         * Получение данных о пользователе
         */
        function get_data_user(){
            /**
             * Проверяем  есть ли куки с сесией и айди пользователя
             */
            let idUser = get_cookie('id_user'),
                sessionId = get_cookie('session_id');

            if(idUser != null && sessionId != null){
                /**
                 * Если есть куки то:
                 * отправляем их аяксом на сервер и получаем список учеников
                 */
                id_user = idUser;

                $.ajax({
                    type: 'POST',
                    url: baseUrl + 'rest_api/index.php',
                    data: {
                        router: 'studs',
                        id_user: id_user,
                        session_id: sessionId
                    },
                    success: function (html) {
                        console.log(html);
                        if(html.access == true && html['records'].length > 0) {
                            console.log('studs_info');
                            /**
                             * Если вернулись данные то в модалку помещаем селектор или инпут с данными ученика
                             */
                            let stud_info = html.records,
                                div_studs = modal.querySelector('.stud');
                            /**
                             * location_list.innerHTML = selector_html(html, 'location_'+id_modal, 'location');
                             */
                            if (Object.keys(stud_info).length > 1) {
                                div_studs.classList.add('select');
                                /**
                                 * Если больше 1-го то создать лист с студентами
                                 * и навесить на него слушателя
                                 */
                                div_studs.innerHTML = selector_html(html, 'students_'+id_modal, 'id_stud');

                                /**
                                 * Навешиваем слушателя на выбор ученика
                                 */
                                let stud_select = div_studs.querySelector('select');
                                stud_select.addEventListener("change", function(){
                                    // //     // Если нужно value
                                    // //     // input.value = this.value;
                                    // //     // Если нужен текст
                                    id_stud = this.value;
                                    // //     //вызов
                                    // //     //get_teachers_list(id_modal, id_subject, id_location, id_class);
                                    // //     get_schedule_list(id_modal, id_subject, id_location, id_class, id_type);
                                    /**
                                     * Получаем класс ученика
                                     */
                                    ajax_get_klass_user();
                                });

                            }else{
                                div_studs.classList.remove('select');
                                /**
                                 * Если один ученик, добавить инпут с ним и записать его айди в переменную
                                 */
                                let stud = html['records'][0]
                                id_stud = stud.id;
                                div_studs.innerHTML = '<input type="hidden" name="id_stud" value="' + id_stud + '">';
                                /**
                                 * Получить класс ученика
                                 */
                                ajax_get_klass_user();
                            }

                        }else{
                            /**
                             * Получаем список типов групп
                             */
                            start_select();
                        }
                        /**
                         * UPDATE `students` SET test_pass = 1, agent = 1
                         * WHERE id IN (SELECT id_stud FROM `aboniments` WHERE p3=1 AND p4=1 AND p5=1 AND status IN (1, 5) AND dt > 1589948468 GROUP BY id_stud)
                         */
                    }, error: function (jqXHR, exception) {
                        view_errors(jqXHR, exception);
                        start_select();
                        console.log('error');
                    }
                });
            }else{
                start_select();
            }
        }

        /**
         * Получение данных из кук
         * @param cookie_name
         * @returns {*}
         */
        function get_cookie ( cookie_name )
        {
            let results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );

            if ( results )
                return ( unescape ( results[2] ) );
            else
                return null;
        }

        /**
         * Очистка полей формы при закрытии
         */
        function clear_form(modal) {
            let form = modal.querySelector('form');
            $(form).trigger('reset');
        }

        /**
         * Начало работы
         */
        function start_select() {

            //console.log('user: '+id_user+', stud: '+id_stud+', klass: '+stud_klass);

            let spinner = modal.querySelector('.spinner-border');
            //скроем форму
            let form = modal.querySelector('form');
            if(form != null) {
                form.style.display = "none";
                spinner.style.display = "block"; //показываем спинер
                //получаем тип предмета, его передаем при создании кнопки вызова,
                // через атрибут subject
                id_subject = form.querySelector('.id_subject').value;
                /**
                 * делаем проверку есть ли ученики:
                 * Если нет тпросто выбор, но все площадки
                 *
                 * Если есть один ученик или несколько,
                 * если один - то это инпут и сразу получаем из него id_stud
                 * если несколько - список с выбором, то навешиваем слушателя
                 */
                get_type_list(spinner, form);
            }
        }

        /**
         * Выбор площадки
         */
        function select_location() {
            // поиск блока с классами
            let location_list = modal.querySelector('.locations');

            //замещаем все спинером пока не получим результат из БД
            location_list.innerHTML = spiner_html();
            //удалим класс так как иначе останется рамка
            location_list.classList.remove('select');
            location_list.style.position = 'relative';

            $.ajax({
                type: 'POST',
                url: baseUrl + 'rest_api/index.php',
                data: {
                    router: 'loc_list',
                    subject: id_subject,
                    id_type: id_type,
                    stud_klass: stud_klass,
                    id_user: id_user,
                    id_location: id_location,
                    id_stud: id_stud
                },
                success: function (html) {
                    console.log(html);
                    location_list.classList.add('select');
                    location_list.innerHTML = selector_html(html, 'location_'+id_modal, 'location');
                    /**
                     * Выборка преподавателя,
                     * навешиваем слушателя на изменение в списке
                     */
                    let select_list_location = location_list.querySelector('select');
                    select_list_location.addEventListener("change", function(){
                        console.log('re');
                        // Если нужно value
                        // input.value = this.value;
                        // Если нужен текст
                        id_location = this.value;
                        //вызов
                        get_klass();

                    });

                }, error: function (jqXHR, exception) {
                    view_errors(jqXHR, exception);
                }
            });
        }

        /**
         * Получение списка классов и заполнение  списка выбора
         */
        function get_klass() {
            // поиск блока с классами
            let klass_list = modal.querySelector('.klass');

            /**
             * Если есть идентификатор студента и класс, а также тип группы долен быть 2 (агентские),
             * то блокируем выбор класса, и подставляем инпут с классом ученика
             */
            if(id_user != null && id_stud != null && stud_klass != null && id_type == 2 && id_subject == 1){
                klass_list.classList.remove('select');
                klass_list.innerHTML = '<input type="hidden" value="'+stud_klass+'" name="stud_klass" id="stud_klass_' + id_modal+'">';
                get_schedule_list();
            }else {
                //замещаем все спинером пока не получим результат из БД
                klass_list.innerHTML = spiner_html();
                //удалим класс так как иначе останется рамка
                klass_list.classList.remove('select');
                klass_list.style.position = 'relative';

                $.ajax({
                    type: 'POST',
                    url: baseUrl + 'rest_api/index.php',
                    data: {
                        router: 'klass_list',
                        subject: id_subject,
                        id_type: id_type,
                        stud_klass: stud_klass,
                        id_user: id_user,
                        id_location: id_location,
                        id_stud: id_stud
                    },
                    success: function (html) {
                        console.log(html);
                        klass_list.classList.add('select');
                        klass_list.innerHTML = selector_html(html, 'klass_' + id_modal, 'klass');
                        /**
                         * Выборка преподавателя,
                         * навешиваем слушателя на изменение в списке
                         */
                        let select_list_klass = klass_list.querySelector('select');
                        select_list_klass.addEventListener("change", function () {
                            // Если нужно value
                            // input.value = this.value;
                            // Если нужен текст
                            id_class = this.value;
                            console.log(id_class);
                            get_schedule_list();
                        });

                    }, error: function (jqXHR, exception) {
                        view_errors(jqXHR, exception);
                    }
                });
            }
        }

        /**
         *  Получение типов групп
         */
        function get_type_list(spinner, form) {
            /**
             * Проверяем есть ли инпут с названием type
             */
            let input_type = form.querySelector('input[name="type"]').value;
            if(input_type != null){
                id_type = input_type;
                spinner.style.display = "none";//скрываем спинер
                form.style.display = 'block'; //показывем селекторы
                //вызов
                select_location();
            }else{
                $.ajax({
                    type: 'POST',
                    url: baseUrl + 'rest_api/index.php',
                    data: {
                        router: 'type_list',
                        subject: id_subject,
                        id_type: id_type,
                        stud_klass: stud_klass,
                        id_user: id_user,
                        id_location: id_location,
                        id_stud: id_stud
                    },
                    success: function (html) {
                        console.log('user: '+id_user+', stud: '+id_stud+', klass: '+stud_klass+' id_subject: '+id_subject+' id_type: '+id_type+' ');
                        console.log(html);
                        spinner.style.display = "none";//скрываем спинер
    
                        form.style.display = 'block'; //показывем селекторы
    
                        //add in form div.location
                        let sel_list_type = form.querySelector('.type');
                        sel_list_type.innerHTML = selector_html(html, 'type_'+id_modal, 'type');
    
                        //let select_list_klass = modal.querySelector('#'+'klass_'+id_modal);
                        let list_type = sel_list_type.querySelector('select');
    
                        //list_type.disabled = false;
    
                        list_type.addEventListener("change", function(){
                        // //     // Если нужно value
                        // //     // input.value = this.value;
                        // //     // Если нужен текст
                              id_type = this.value;
                        // //     //вызов
                        // //     //get_teachers_list(id_modal, id_subject, id_location, id_class);
                        // //     get_schedule_list(id_modal, id_subject, id_location, id_class, id_type);
    
                             select_location();
                        });
    
                    }, error: function (jqXHR, exception) {
                        view_errors(jqXHR, exception);
                    }
                });
            }
        }
        /**
         * Получение списка возможных дней и времени
         */
        function get_schedule_list() {
            // поиск блока с классами
            let schedule_list = modal.querySelector('.schedule');
            console.log(schedule_list);
            //замещаем все спинером пока не получим результат из БД
            schedule_list.innerHTML = spiner_html();
            //удалим класс так как иначе останется рамка
            schedule_list.classList.remove('select');
            schedule_list.style.position = 'relative';
            $.ajax({
                type: 'POST',
                url: baseUrl + 'rest_api/index.php',
                data: {
                    router: 'schedule',
                    subject: id_subject,
                    id_type: id_type,
                    stud_klass: stud_klass,
                    id_user: id_user,
                    id_location: id_location,
                    id_stud: id_stud,
                    location: id_location,
                    id_class: id_class

                },
                success: function (html) {
                    console.log(html);
                    schedule_list.classList.add('select');
                    schedule_list.innerHTML = selector_html(html, 'schedule_'+id_modal, 'schedule');

                }, error: function (jqXHR, exception) {
                    view_errors(jqXHR, exception);
                }
            });
        }

        /**
         * Вывод ошибок
         */
        function view_errors(jqXHR, exception) {
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }


        /**
         * Спинер
         */
        function spiner_html() {
            return '<div class="spinner-border mt-3" role="status" >' +
                        '<span class="visually-hidden">Загрузка...</span>' +
                   '</div>';
        }

        /**
         * Создаем список для селектора
         * получаем параметры:
         * data - массив даных из базы (два поля интересуют id и name)
         * id_selector - идентификатор ( имя+идентификатор модалки)
         * name_selector - название селектора
         */
        function selector_html(data, id_selector, name_selector) {
            let select_list = '<select name="'+name_selector+'" id="'+id_selector+'" onchange="this.style.color=\'black\'">';

            /**
             * SELECT * FROM `aboniments` where id_group IN (SELECT id FROM `groups` where code LIKE 'ОлимпиадаМКл%-Политех-%' AND active = 6) AND status IN (1,5)
             * SELECT  a.id_user, p.familia, p.name, id_stud FROM `aboniments` AS a LEFT JOIN parent AS p USING(id_user) where id_group IN (SELECT id FROM `groups` where code LIKE 'ОлимпиадаМКл%-Политех-%' AND active = 6) AND status IN (1,5)
             SELECT a.id_group, g.code, a.id_user, p.familia, p.name, id_stud, s.name, l.phone, l.email
                FROM `aboniments` AS a LEFT JOIN parent AS p ON a.id_user = p.id_user
                LEFT JOIN `students` AS s ON a.id_stud = s.id
                LEFT JOIN `logins` AS l ON a.id_user = l.id
                LEFT JOIN 'groups' AS g ON a.id_group = g.id
                WHERE id_group IN (SELECT id FROM `groups` where code LIKE 'ОлимпиадаМКл%-Политех-%' AND active = 6) AND status IN (1,5) ORDER BY id_group


             */

            let name; //подпись по умолчанию
            if(name_selector === 'location'){
                name = "Площадка";
            }else if(name_selector === 'klass') {
                name = "Класс";
            }else if(name_selector === 'teach') {
                name = "Преподаватель";
            }else if(name_selector === 'schedule'){
                name = "День";
            }else if(name_selector === 'type') {
                name = "Тип группы"
            }else if(name_selector === 'id_stud'){
                name = "Ученик";
            }else{
                name = "не указан";
            }

            //optiont - default
            select_list +='<option value="" style="display:none">'+name+'</option>';

            for (var i = 0, l = data['records'].length; i < l; i++) {

                let item = data['records'][i],
                    id   = item['id'],
                    code = item['name'];

                //add options
                select_list += '<option value="'+id+'">'+code+'</option>';
            }
            //close select list
            select_list += '</select>';
            return select_list;
        }

        /**
         * AJAX: получаем класс в котором учитсе ученик сейчас
         */
        function ajax_get_klass_user() {
            $.ajax({
                method: "POST",
                type: "POST",
                url: baseUrl + 'rest_api/index.php',
                data: {
                    router: 'klass_stud',
                    id_stud: id_stud,
                    id_user: id_user
                },
                success: function (html) {
                    let stud_info = html['records'][0];
                    //проверка указан ли класс
                    if(test_year_in_school(stud_info['year_sc'])){
                        let now = new Date();
                        if(new Date('2021-09-01T00:00:00') < now){
                            /**
                             * Если сейчас уже 1-е сентября
                             */
                            stud_klass = stud_info['klass_now'];
                        }else{
                            /**
                             * Если 1-е сентября еще не наступило
                             */
                            stud_klass = stud_info['klass'];
                        }
                        /**
                         * Получаем список типов групп
                         */
                        start_select();
                    }

                }, error: function (jqXHR, exception) {
                    console.log('error');
                    view_errors(jqXHR, exception);
                }
            });

        }

        /**
         * Проверка указан ли год поступления в школу
         */
        function test_year_in_school(year_in_school) {
            if(year_in_school == null){
                alert('Неуказан класс');
                return false;
            }
            return true;
        }

    });
});