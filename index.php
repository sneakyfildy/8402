<!DOCTYPE html>
<html>
    <head>
        <title>8402</title>
        <meta charset="UTF-8">
        <link rel="stylesheet" type="text/css" href="css/project.compiled.css" />
        <script src="https://hammerjs.github.io/dist/hammer.js"></script>
        <meta content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' name='viewport' />
        <meta name="viewport" content="width=device-width" />
    </head>
    <body>
        <div id="gamefield" ng-controller="GameFieldController" style="display:none;"></div>
        <!-- End of content -->
        <script>
            window.Config = window.Config || {};
            window.Config.debug = <?php if (ISSET($_GET['prod'])){ echo '0';}else{echo '1';}?>;
        </script>
        <script data-main="js/loader" src="js/vendor/require/require.js"></script>
    </body>
</html>
