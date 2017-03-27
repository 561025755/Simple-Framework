
    $("#province").change(function () {
        $('#city option[value!=""]').each(function (index, obj) {
            $(this).remove();
        });
        $('#city option[value=""]').show().attr('selected', true);

        var provinceCode = $(this).val();
        if (provinceCode != '') {
            $.ajax({
                type: 'POST',
                async: false,
                url: '/Equipment/GetCity',
                data: { provinceCode: provinceCode },
                dataType: 'JSON',
                success: function (data) {

                    if (data.cities != null && data.cities.length > 0) {
                        $(data.cities).each(function (index, obj) {
                            $('#city').append("<option value='" + obj.Code + "'>" + obj.Name + "</option>");
                        })
                    }
                }
            })
        }
        $("#city").change();
    });
    $("#city").change(function () {
        $('#region option[value!=""]').each(function (index, obj) {
            $(this).remove();
        });
        $('#region option[value=""]').show().attr('selected', true);

        var cityCode = $(this).val();
        if (cityCode != '') {
            $.ajax({
                type: 'POST',
                async: false,
                url: '/Equipment/GetRegion',
                data: { cityCode: cityCode },
                dataType: 'JSON',
                success: function (data) {
                    if (data.regions != null && data.regions.length > 0) {
                        $(data.regions).each(function (index, obj) {
                            $('#region').append("<option value='" + obj.Code + "'>" + obj.Name + "</option>");
                        })
                    }
                }
            })
        }

    });
