# Fire



```yaml
x-swagger-fire:
	from: feed
	where: "{ carId:$carId, algo: {$gt: 1123 } }"
	action: count
	to: cars

```

