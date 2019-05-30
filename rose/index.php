<!DOCTYPE HTML>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">

	<!-- Custom CSS -->
	<link href="css/custom.css" rel="stylesheet">
    <link href="css/animate.css" rel="stylesheet">
	
    <title>HOME &bull; Rose Nutrition</title>
  </head>
  <body>
    <nav class="navbar navbar-expand-lg navbar-light custom-nav fixed-top" style="background-color: #f7b1bb;">
		<a class="navbar-brand" href="#" style="color:white">
			<img src="rosewhite.png" width="40" height="40" class="d-inline-block align-top" alt="">
			rose
		</a>
	</nav>
	
	<div class="container">
		<div class="row">
			<div class="col-lg-12">
				<h1 class="mt-5">Welcome to Rose.</h1>
				<hr>
			</div>
		</div>
		
		<div class="row">
			<div class="col-lg-12">
				<p>Thank you for keeping healthy with us. Here's all the meals you've saved.</p>
			</div>
		</div>
		
		<div class="row justify-content-center">
			<div class="col-lg-8 animated fadeInLeft">
				<div class="table-responsive">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Time of Meal</th>
							<th>Meal</th>
							<th>Date of Meal</th>
							<th>Food Group</th>
							<th>Unhealthy Rating (/5)</th>
						</tr>
					</thead>
					<tbody>
						<?php
							require 'aws-autoloader.php';
							date_default_timezone_set('UTC');
							
							use Aws\DynamoDb\Exception\DynamoDbException;
							use Aws\DynamoDb\Marshaler;
							
							$sdk = new Aws\Sdk([
								'region'	=> 'eu-west-1',
								'version'	=> 'latest'
							]);
							
							$dynamodb = $sdk->createDynamoDb();
							$marshaler = new Marshaler();
							
							
							$params = [
								'TableName' => 'Alexameals',
								'ProjectionExpression' => 'Mealtime, FoodEaten, #date, FoodGroup, FatScore',
								'ExpressionAttributeNames' => ['#date' => 'Date'],
							];
							
							try {
								while(true) {
									$result = $dynamodb->scan($params);
									
									foreach ($result['Items'] as $i) {
										$meal = $marshaler->unmarshalItem($i);
										echo '<tr>';
										echo '<td>';
										echo $meal['Mealtime'];
										echo '</td>';
										echo '<td>';
										echo $meal['FoodEaten'];
										echo '</td>';
										echo '<td>';
										echo $meal['Date'];
										echo '</td>';
										echo '<td>';
										echo $meal['FoodGroup'];
										echo '</td>';
										if($meal['FatScore'] == 1 || $meal['FatScore'] == 2) {
											echo '<td class="table-success">';
											echo $meal['FatScore'];
											echo '</td>';
										} else if($meal['FatScore'] == 4) {
											echo '<td class="table-warning">';
											echo $meal['FatScore'];
											echo '</td>';
										} else if($meal['FatScore'] == 5) {
											echo '<td class="table-danger">';
											echo $meal['FatScore'];
											echo '</td>';
										} else {
											echo '<td>';
											echo $meal['FatScore'];
											echo '</td>';
										}
										echo '</tr>';
									}
									
									if(isset($result['LastEvaluatedKey'])) {
										$params['ExclusiveStartKey'] = $result['LastEvaluatedKey'];
									} else {
										break;
									}
								}
							} catch(DynamoDbException $e) {
								echo 'Unable to scan database: \n';
								echo $e->getMessage() . '\n';
							}
						?>
					</tbody>
				</table>
				</div>
				<?php
					$dates=array();
					$ratings=array();
					
					$eav = $marshaler->marshalJson('
						{
							":mealtime":"breakfast",
							":date": "2019-7-7"
						}
					');
					
					$params = [
						'TableName' => 'Alexameals',
						'ProjectionExpression' => 'Mealtime, #date, FatScore',
						'ExpressionAttributeNames' => ['#date' => 'Date'],
						'KeyConditionExpression' =>
							'Mealtime = :mealtime and #date < :date',
						'ExpressionAttributeValues' => $eav
					];
							
					try {
						
							$result = $dynamodb->query($params);
						
							foreach ($result['Items'] as $i) {
								$meal = $marshaler->unmarshalItem($i);
								array_push($dates, $meal['Date']);
								array_push($ratings, $meal['FatScore']);
							}
							
						
					} catch(DynamoDbException $e) {
						echo 'Unable to query database: \n';
						echo $e->getMessage() . '\n';
					}
				?>
				
				<?php
					$dates2=array();
					$ratings2=array();
					
					$eav = $marshaler->marshalJson('
						{
							":mealtime":"lunch",
							":date": "2019-7-7"
						}
					');
					
					$params = [
						'TableName' => 'Alexameals',
						'ProjectionExpression' => 'Mealtime, #date, FatScore',
						'ExpressionAttributeNames' => ['#date' => 'Date'],
						'KeyConditionExpression' =>
							'Mealtime = :mealtime and #date < :date',
						'ExpressionAttributeValues' => $eav
					];
							
					try {
						
							$result = $dynamodb->query($params);
						
							foreach ($result['Items'] as $i) {
								$meal = $marshaler->unmarshalItem($i);
								array_push($dates2, $meal['Date']);
								array_push($ratings2, $meal['FatScore']);
							}
							
						
					} catch(DynamoDbException $e) {
						echo 'Unable to query database: \n';
						echo $e->getMessage() . '\n';
					}
				?>
				
				<?php
					$dates3=array();
					$ratings3=array();
					
					$eav = $marshaler->marshalJson('
						{
							":mealtime":"dinner",
							":date": "2019-7-7"
						}
					');
					
					$params = [
						'TableName' => 'Alexameals',
						'ProjectionExpression' => 'Mealtime, #date, FatScore',
						'ExpressionAttributeNames' => ['#date' => 'Date'],
						'KeyConditionExpression' =>
							'Mealtime = :mealtime and #date < :date',
						'ExpressionAttributeValues' => $eav
					];
							
					try {
						
							$result = $dynamodb->query($params);
						
							foreach ($result['Items'] as $i) {
								$meal = $marshaler->unmarshalItem($i);
								array_push($dates3, $meal['Date']);
								array_push($ratings3, $meal['FatScore']);
							}
							
						
					} catch(DynamoDbException $e) {
						echo 'Unable to query database: \n';
						echo $e->getMessage() . '\n';
					}
				?>
				
				<?php
				$arrlength=count($dates);
				for($x=0;$x<$arrlength;$x++)
				{
					$date = $date . '"' . $dates[$x] . '",';
				}
				
				$arrlength2=count($ratings);
				for($x=0;$x<$arrlength2;$x++)
				{
					$rate = $rate . '"' . $ratings[$x] . '",';
				}
				
				$arrlength3=count($dates2);
				for($x=0;$x<$arrlength3;$x++)
				{
					$date2 = $date2 . '"' . $dates2[$x] . '",';
				}
				
				$arrlength4 = count($ratings2);
				for($x=0;$x<$arrlength4;$x++)
				{
					$rate2 = $rate2 . '"' . $ratings2[$x] . '",';
				}
				
				$arrlength5=count($dates3);
				for($x=0;$x<$arrlength5;$x++)
				{
					$date3 = $date3 . '"' . $dates3[$x] . '",';
				}
				
				$arrlength6 = count($ratings2);
				for($x=0;$x<$arrlength6;$x++)
				{
					$rate3 = $rate3 . '"' . $ratings3[$x] . '",';
				}
				?>
				<h4>Ratings Graphs</h4>
				<p>The ratings you've given each meal over time</p>
				<div id="carouselCharts" class="carousel slide" data-ride="carousel">
					<ol class="carousel-indicators">
						<li data-target="#carouselCharts" data-slide-to="0" class="active"></li>
						<li data-target="#carouselCharts" data-slide-to="1"></li>
						<li data-target="#carouselCharts" data-slide-to="2"></li>
					</ol>
					<div class="carousel-inner">
						<div class="carousel-item active">
							<canvas id="myChart"></canvas>
							<script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0"></script>
							<script>
								var ctx = document.getElementById('myChart').getContext('2d');
								var chart = new Chart(ctx, {
									// The type of chart we want to create
									type: 'line',

									// The data for our dataset
									data: {
										labels: [<?php echo $date; ?>],
										datasets: [{
											label: 'Breakfast Rating',
											backgroundColor: 'rgb(37, 139, 235)',
											borderColor: 'rgb(17, 91, 160)',
											data: [<?php echo $rate; ?>]
										}]
									},

									// Configuration options go here
									options: {
										scales: {
											yAxes: [{
												type: 'category',
												labels: ['5', '4', '3', '2', '1', '0']
											}]
										}
									}
								});
							</script>
						</div>
						<div class="carousel-item">
							<canvas id="myChart2"></canvas>
							<script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0"></script>
							<script>
								var ctx = document.getElementById('myChart2').getContext('2d');
								var chart = new Chart(ctx, {
									// The type of chart we want to create
									type: 'line',

									// The data for our dataset
									data: {
										labels: [<?php echo $date2; ?>],
										datasets: [{
											label: 'Lunch Rating',
											backgroundColor: 'rgb(253, 54, 51)',
											borderColor: 'rgb(239, 13, 10)',
											data: [<?php echo $rate2; ?>]
										}]
									},

									// Configuration options go here
									options: {
										scales: {
											yAxes: [{
												type: 'category',
												labels: ['5', '4', '3', '2', '1', '0']
											}]
										}
									}
								});
							</script>
						</div>
						<div class="carousel-item">
							<canvas id="myChart3"></canvas>
							<script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0"></script>
							<script>
								var ctx = document.getElementById('myChart3').getContext('2d');
								var chart = new Chart(ctx, {
									// The type of chart we want to create
									type: 'line',

									// The data for our dataset
									data: {
										labels: [<?php echo $date3; ?>],
										datasets: [{
											label: 'Dinner Rating',
											backgroundColor: 'rgb(248, 242, 67)',
											borderColor: 'rgb(234, 227, 6)',
											data: [<?php echo $rate3; ?>]
										}]
									},
	
									// Configuration options go here
									options: {
										scales: {
											yAxes: [{
												type: 'category',
												labels: ['5', '4', '3', '2', '1', '0']
											}]
										}
									}
								});
							</script>
						</div>
					</div>
					<a class="carousel-control-prev" href="#carouselCharts" role="button" data-slide="prev">
						<span class="carousel-control-prev-icon" aria-hidden="true"></span>
						<span class="sr-only">Previous</span>
					</a>
					<a class="carousel-control-next" href="#carouselCharts" role="button" data-slide="next">
						<span class="carousel-control-next-icon" aria-hidden="true"></span>
						<span class="sr-only">Next</span>
					</a>
				</div>
			</div>
		</div>
	</div>
	
	<footer class="footer bg-dark">
		<div class="container">
			<span class="text-muted">©Neil Moultrie 2019</span>
		</div>
	</footer>

    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
  </body>
</html>