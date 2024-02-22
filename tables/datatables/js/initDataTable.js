const initDataTable = (selector, customSettings = {}) => {
    let timer;
    let isFetching = false;
    let itemsToFilter = {};
    const excludeColumnsFiltering = ["OPCIONES", "SELECCIONAR"];
    const tbody = $(`${selector} tbody`)[0];

    const recalcLeft = () => {
        let leftPosition = Array.from($(`${selector} thead tr`))
            .map(m => Array.from($(m).children('th')).filter(x => $(x).hasClass("dtfc-fixed-left")))
            .filter(m => m.length > 0);

        if (leftPosition.length > 0) {
            let [pos] = leftPosition;
            let newPos = Array.from($(`${selector} .filters th`)).filter((x) => $(x).hasClass("recalc-width"));
            if (newPos.length === pos.length) newPos.map((x, i) => $(x).css({ 'left': $(pos[i]).css("left") }))
        }
    }

    let isInfinitecroll = $(`${selector}`).attr('data-infinite-scroll');
    
    $(`${selector} thead tr`)
        .clone(true)
        .addClass('filters')
        .appendTo(`${selector} thead`);

    let table = $(selector).DataTable({
        responsive: isInfinitecroll == undefined || isInfinitecroll.toLowerCase() !== 'true',
        lengthChange: false,
        autoWidth: false,
        dom: 'lBrtp',
        orderCellsTop: true,
        order: [],
        fixedHeader: false,
        "language": {
            "infoEmpty": "No hay registros",
        },
        destroy: true,
        pageLength: 5,
        paging:'true',
        initComplete: function (e, settings, json) {
            let api = this.api();
            api
                .columns()
                .eq(0)
                .each(function (colIdx) {
                    let cell = $(`${selector} .filters th`).eq($(api.column(colIdx).header()).index());
                    let title = $(cell).text();
                    let cursorPosition = 0;

                    $(cell).addClass("p-1 m-0");
                    if (customSettings.hasOwnProperty("fixedColumns") && customSettings.fixedColumns.hasOwnProperty("left"))
                        if ((colIdx + 1) <= customSettings.fixedColumns.left)
                        {
                            $(cell).css({ 'position': 'sticky' });
                            $(cell).addClass("recalc-width");
                        } 

                    if (!$(api.column(colIdx).header()).is(":visible"))
                        $(cell).css({ 'display': 'none' });

                    if (excludeColumnsFiltering.includes(title.trim().toUpperCase())) {
                        $(cell).html("");
                        return;
                    }
                    $(cell).html(`<input type="text" class="form-control form-control-sm cm-input-filtering" placeholder="Filtrar..." style="width: 100%" />`);

                    $('input', $(`${selector} .filters th`).eq($(api.column(colIdx).header()).index()))
                        .off('keyup change')
                        .on('change', function (e) {
                            itemsToFilter = {};
                            Array.from($(`${selector} .filters th[data-row-name]`))
                                .filter(m =>
                                    $(m).children('input').first() != undefined &&
                                    $(m).children('input').first().val() != "" &&
                                    $(m).attr("data-row-name") != "controls")
                                .map(m => itemsToFilter[$(m).attr("data-row-name")] = $(m).children('input').first().val());

                            $(this).attr('title', $(this).val());
                            let regexr = '({search})';
                            cursorPosition = this.selectionStart;
                            api.column(colIdx)
                                .search(
                                    this.value != ''
                                        ? regexr.replace('{search}', `(((${this.value})))`)
                                        : '',
                                    this.value != '',
                                    this.value == ''
                            ).draw();

                            if (isInfinitecroll != undefined && isInfinitecroll.toLowerCase() === 'true')
                                fetchData(itemsToFilter);

                            recalcLeft();
                            $(`${selector} tbody tr`).addClass('body-scroll-table');
                        })
                        .on('keyup', function (e) {
                            e.stopPropagation();

                            $(this).trigger('change');
                            $(this).focus()[0].setSelectionRange(cursorPosition, cursorPosition);
                            recalcLeft();
                            $(`${selector} tbody tr`).addClass('body-scroll-table');
                        });
                });
        },
        ...customSettings
    });
}