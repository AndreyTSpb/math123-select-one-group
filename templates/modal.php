<?php
/**
 * Created by PhpStorm.
 * User: andrey
 * Date: 17/04/2021
 * Time: 20:54
 */
?>
<!-- Button trigger modal -->
<button type="button" class="btn-sub btn-record-to-groups" data-bs-toggle="modal" data-bs-target="#modal_record_<?=$data['key_btn']?>">
    <?=$data['title'];?>
</button>

<!-- Modal -->
<div class="modal fade" id="modal_record_<?=$data['key_btn']?>" tabindex="-1" aria-labelledby="modal_record_<?=$data['key_btn']?>" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-select-one-subject">
        <div class="modal-content">
            <div class="select-groups-grid-item <?=$data['color'];?>">
                <div class="select-groups-grid-item-notice">
                    Для отображения списка гупп выберите подходящие параметры и нажмите ЗАПИСАТЬСЯ
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="select-groups-grid-item-form">
                    <div class="spinner-border" role="status" style="display:none;">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                    <form action="<?=$data['action_url'];?>" method="post">
                        <input type="hidden" name="id_user" value="">
                        <div class="stud">

                        </div>
                        <input type="hidden" class="id_subject" name="id_subject" value="<?=$data['subject']?>">
                        <?php if($data['type']):?>
                            <input type="hidden" class="type" name="type" value="<?=$data['type']?>"> 
                        <?php else:?>
                        <div class="select type">
                            <select name="" id="" onchange="this.style.color='black'" disabled>
                                <option value="" style="display:none">Тип группы</option>
                            </select>
                        </div>
                        <?php endif;?>
                        
                        <div class="select locations">
                            <select name="" id="" onchange="this.style.color='black'" disabled>
                                <option value="" style="display:none">Площадка</option>
                            </select>
                        </div>
                        <div class="select klass">
                            <select name="" id="" onchange="this.style.color='black'" disabled>
                                <option value="" style="display:none">Класс</option>
                            </select>
                        </div>
                        <div class="select schedule">
                            <select name="" id="" onchange="this.style.color='black'" disabled>
                                <option value="" style="display:none">День</option>
                            </select>
                        </div>
                        <div class="select-groups-grid-item-form-footer">
                            <button class="btn">записаться</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
