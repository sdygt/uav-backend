# 一个无人机(uav)

```json
{
  "_id": "(ObjectID)",
  "name": "无人机的标签/名称",
  "position": {
    "type": "Point",
    "coordinates": [
      -73.856077,
      //longitude
      40.848447
      //latitude
    ]
  },
  "max_speed": 300,
  "max_distance": 400,
  "assoc_tasks": [
    "task_id",
    "task_id",
    "..."
  ]
}
```

# 一个任务(task)

## 攻击/侦查任务

```json
{
  "_id": "ObjectID()",
  "name": "Task name",
  "type": "attack|research",
  "target": {
    "type": "Point",
    "coordinates": [121.5, 31.3]
  },
  "startTime": "Date(<YYYY-mm-ddTHH:MM:ssZ>)",
  "endTime": "Date(<YYYY-mm-ddTHH:MM:ssZ>)"
}
```

## 巡航任务

```json
{
  "_id": "ObjectID()",
  "name": "Task name",
  "type": "cruise",
  "target": {
    "type": "MultiPoint",
    "coordinates": [
      [-73.9580, 40.8003],
      [-73.9498, 40.7968],
      [-73.9737, 40.7648],
      [-73.9814, 40.7681]
    ]
  },
  "nLoop": 3, //巡航圈数
  "startTime": "Date(<YYYY-mm-ddTHH:MM:ssZ>)",
  "endTime": "Date(<YYYY-mm-ddTHH:MM:ssZ>)"
}
```

# 禁飞区(no-fly)

## 多边形禁飞区

```json
{
  "_id": "ObjectID()",
  "name": "no-fly zone name",
  "area": {
    "type": "Polygon",
    "coordinates": [
      [
        [100.0, 0.0],
        [101.0, 0.0],
        [101.0, 1.0],
        [100.0, 1.0],
        [100.0, 0.0]
      ]
    ]
  }
}

```

技术上来说，多边形禁飞区允许有“洞”。此时第一个多边形为外圈。

```json
{
  "_id": "ObjectID()",
  "name": "no-fly zone name",
  "area": {
    "type": "Polygon",
    "coordinates": [
      [
        [100.0, 0.0],
        [101.0, 0.0],
        [101.0, 1.0],
        [100.0, 1.0],
        [100.0, 0.0]
      ],
      [
        [100.8, 0.8],
        [100.8, 0.2],
        [100.2, 0.2],
        [100.2, 0.8],
        [100.8, 0.8]
      ]
    ]
  }
}

```

## 敌方雷达覆盖区

实际上是一片圆形区域

```json
{
  "_id": "ObjectID()",
  "name": "no-fly zone name",
  "area": {
    "type": "Point",
    "coordinates": [121.5, 31.3],
    "radius": 100
  }
}
```

但需要说明的是，此处`radius`并不是[GeoJSON](https://tools.ietf.org/html/rfc7946)规定的属性，而是自行扩充的。

# 方案(scheme)

```json
{
  "_id": "ObjectID()",
  "name": "no-fly zone name",
  "uav": "uav oid",
  "tasks": [
    "task oid",
    "..."
  ],
  "no-flies": [
    "nf oid",
    "..."
  ]
}
```
