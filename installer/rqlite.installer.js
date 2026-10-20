import t from"node:fs";import r from"node:path";let n={payload:`/******/ var __webpack_modules__ = ({

/***/ 706
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Nw: () => (/* binding */ searchData)
/* harmony export */ });
/* unused harmony exports isEqualArray, isEqualObject, queryData, sortData */
/* unused harmony import specifier */ var getValueFromObject;
/* unused harmony import specifier */ var isValidDate;


function isEqualArray(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return false;
  }
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (!isEqualValue(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
}
function isEqualObject(obj1, obj2) {
  if (Object.is(obj1, obj2)) return true;
  if (!obj1 || !obj2 || typeof obj1 !== "object" || typeof obj2 !== "object") {
    return false;
  }
  if (obj1 instanceof Date || obj2 instanceof Date) {
    return obj1 instanceof Date && obj2 instanceof Date && obj1.getTime() === obj2.getTime();
  }
  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    return isEqualArray(obj1, obj2);
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key) || !isEqualValue(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
}
function isEqualValue(value1, value2) {
  if (Object.is(value1, value2)) return true;
  if (Array.isArray(value1) || Array.isArray(value2)) {
    return isEqualArray(value1, value2);
  }
  if (value1 && value2 && typeof value1 === "object" && typeof value2 === "object") {
    return isEqualObject(value1, value2);
  }
  return false;
}
function queryMatch(data, query) {
  for (let key of Object.keys(query)) {
    let dataValue;
    try {
      dataValue = getValueFromObject(data, key, true);
    } catch (error) {
      return false;
    }
    if (typeof query[key] === "string" || typeof query[key] === "number" || typeof query[key] === "boolean") {
      if (Array.isArray(dataValue)) return dataValue.includes(query[key]);
      else return dataValue === query[key];
    } else if (Array.isArray(query[key])) {
      if (Array.isArray(dataValue)) {
        return isEqualArray(dataValue, query[key]);
      } else {
        return false;
      }
    } else {
      for (let property of Object.keys(query[key])) {
        if (property === "$options") continue;
        if (!property.startsWith("$")) {
          if (typeof dataValue !== "object") {
            return false;
          } else
            return queryMatch(
              { [property]: getValueFromObject(dataValue, property) },
              { [property]: query[key][property] }
            );
        } else {
          let queryValue = query[key][property];
          if (isValidDate(queryValue) && isValidDate(dataValue)) {
            queryValue = new Date(queryValue);
            dataValue = new Date(dataValue);
          }
          let queryStatus = false;
          switch (property) {
            case "$eq":
              queryStatus = isEqualValue(dataValue, queryValue);
              break;
            case "$ne":
              queryStatus = !isEqualValue(dataValue, queryValue);
              break;
            case "$not":
              queryStatus = !queryMatch(data, {
                [key]: query[key]["$not"]
              });
              break;
            case "$lt":
              queryStatus = dataValue < queryValue;
              break;
            case "$lte":
              queryStatus = dataValue <= queryValue;
              break;
            case "$gt":
              queryStatus = dataValue > queryValue;
              break;
            case "$gte":
              queryStatus = dataValue >= queryValue;
              break;
            case "$in":
              if (Array.isArray(dataValue)) {
                queryStatus = dataValue.some(
                  (element) => queryValue.includes(element)
                );
              } else {
                queryStatus = queryValue.includes(dataValue);
              }
              break;
            case "$nin":
              if (Array.isArray(dataValue)) {
                queryStatus = !dataValue.some(
                  (element) => queryValue.includes(element)
                );
              } else {
                queryStatus = !queryValue.includes(dataValue);
              }
              break;
            case "$all":
              if (Array.isArray(dataValue) && Array.isArray(queryValue)) {
                queryStatus = queryValue.every(
                  (element) => dataValue.includes(element)
                );
              }
              break;
            case "$elemMatch":
              if (Array.isArray(data[key])) {
                queryStatus = data[key].some(
                  (element) => queryMatch(element, query[key][property])
                );
              }
              break;
            case "$size":
              if (Array.isArray(dataValue)) {
                queryStatus = dataValue.length === queryValue;
              }
              break;
            case "$exists":
              queryStatus = queryValue ? data.hasOwnProperty(key) : !data.hasOwnProperty(key);
              break;
            case "$regex":
              if (typeof dataValue === "string") {
                let regexFlag = query[key]["$options"] || "";
                let regex = new RegExp(queryValue, regexFlag);
                queryStatus = regex.test(dataValue);
              }
              break;
            case "$type":
              let dataType = typeof dataValue;
              if (Array.isArray(dataValue)) {
                dataType = "array";
              }
              queryStatus = dataType === queryValue;
              break;
            case "$mod":
              if (typeof dataValue === "number" && Array.isArray(queryValue) && queryValue.length === 2) {
                const [divisor, remainder] = queryValue;
                queryStatus = dataValue % divisor === remainder;
              }
              break;
            case "$where":
              if (typeof queryValue === "function") {
                try {
                } catch (error) {
                  console.error(
                    "Error in queryData $where function:",
                    error
                  );
                }
              }
              break;
            default:
              console.log("unknown operator");
              break;
          }
          if (!queryStatus) return false;
        }
      }
      return true;
    }
  }
}
function queryData(data, query) {
  if (!query) return true;
  if (query.$and) {
    for (let i = 0; i < query.$and.length; i++) {
      if (!queryData(data, query.$and[i])) return false;
    }
  }
  if (query.$nor) {
    for (let i = 0; i < query.$nor.length; i++) {
      if (queryData(data, query.$nor[i])) return false;
    }
  }
  for (let key of Object.keys(query)) {
    if (key === "$and" || key === "$or") continue;
    if (!queryMatch(data, { [key]: query[key] })) return false;
  }
  if (query.$or) {
    for (let i = 0; i < query.$or.length; i++) {
      if (queryData(data, query.$or[i])) return true;
    }
  }
  return true;
}
function searchData(data, search) {
  if (!search) return true;
  if (!Array.isArray(search)) search = [search];
  for (let i = 0; i < search.length; i++) {
    let searchValue = search[i].value;
    if (!Array.isArray(searchValue)) searchValue = [searchValue];
    for (let key in data) {
      let value = data[key];
      let status = false;
      switch (typeof value) {
        case "number":
          value = value.toString();
          break;
        case "object":
          value = JSON.stringify(value);
          break;
        case "function":
          value = value.toString();
          break;
      }
      if (search[i].caseSensitive != "true" || search[i].caseSensitive != true)
        value = value.toLowerCase();
      for (let i2 = 0; i2 < searchValue.length; i2++) {
        let searchString = searchValue[i2];
        if (search[i2].caseSensitive != "true" || search[i2].caseSensitive != true)
          searchString = searchString.toLowerCase();
        if (searchString === "" && search[i2].operator === "and") {
          if (value !== "") return false;
        }
        if (value.indexOf(searchString) > -1) status = true;
        if (status) return true;
        else if (search[i2].operator == "and") return false;
      }
    }
    if (search[i].value.length && search[i].operator == "or") return false;
  }
  return true;
}
function sortData(data, sort) {
  return data.sort((a, b) => {
    for (let i = 0; i < sort.length; i++) {
      let key = sort[i].key;
      if (a[key] == null && b[key] == null) continue;
      if (a[key] == null) return sort[i].direction === "desc" ? -1 : 1;
      if (b[key] == null) return sort[i].direction === "desc" ? 1 : -1;
      if (typeof a[key] !== typeof b[key]) {
        return typeof a[key] < typeof b[key] ? -1 : 1;
      }
      if (a[key] !== b[key]) {
        if (typeof a[key] === "string") {
          return sort[i].direction === "desc" ? b[key].localeCompare(a[key]) : a[key].localeCompare(b[key]);
        } else {
          return sort[i].direction === "desc" ? b[key] - a[key] : a[key] - b[key];
        }
      }
    }
    return 0;
  });
}


/***/ },

/***/ 6
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   O: () => (/* binding */ dotNotationToObject)
/* harmony export */ });
function dotNotationToObject(data = {}, obj = {}) {
  try {
    data ??= {};
    obj ??= {};
    let arrayGroup = {};
    for (const key of Object.keys(data)) {
      let value = data[key];
      let newObject = obj;
      let oldObject = new Object(obj);
      let keys = key.split(".");
      let length = keys.length - 1;
      for (let i = 0; i < keys.length; i++) {
        if (keys[i].endsWith("]")) {
          if (keys[i].endsWith("[]")) {
            let baseKey = keys[i].slice(0, -2);
            if (!Array.isArray(newObject[baseKey])) {
              newObject[baseKey] = [];
            }
            if (length == i) {
              if (Array.isArray(value)) {
                newObject[baseKey].push(...value);
              } else {
                newObject[baseKey].push(value);
              }
            }
          } else if (/\\[([0-9]+)\\]/g.test(keys[i])) {
            let [k, index] = keys[i].split("[");
            index = index.slice(0, -1);
            if (!Array.isArray(newObject[k])) {
              newObject[k] = [];
            }
            if (length == i) {
              if (value === void 0) {
                newObject[k].splice(index, 1);
              } else {
                newObject[k][index] = value;
              }
            } else {
              newObject[k][index] = oldObject[k][index] || {};
              newObject = newObject[k][index];
              oldObject = oldObject[k][index];
            }
          } else if (/\\[\\w\\]/g.test(keys[i])) {
            let [k, group] = keys[i].split("[");
            group = group.slice(0, -1);
            if (!Array.isArray(newObject[k])) {
              newObject[k] = [];
            }
            let index;
            if (arrayGroup[keys.slice(0, i + 1).join(".")]) {
              index = arrayGroup[keys.slice(0, i + 1).join(".")];
            } else {
              index = newObject[k].length;
              arrayGroup[keys.slice(0, i + 1).join(".")] = index;
              newObject[k][index] = {};
            }
            if (length == i) {
              newObject[k][index] = value;
            } else {
              newObject = newObject[k][index];
            }
          }
        } else {
          if (length == i) {
            if (value === void 0) {
              delete newObject[keys[i]];
            } else {
              newObject[keys[i]] = value;
            }
          } else {
            newObject[keys[i]] = oldObject[keys[i]] || {};
            newObject = newObject[keys[i]];
            oldObject = oldObject[keys[i]];
          }
        }
      }
    }
    return obj;
  } catch (error) {
    console.log("Error converting dot notation to object", error);
    return false;
  }
}


/***/ },

/***/ 832
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _utilities_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(561);


function array(method, data) {
  const storageName = data.storageConfig?.name;
  return new Promise(
    async (resolve, reject) => {
      let type = "array";
      let arrayArray = [];
      try {
        const db = await (0,_utilities_js__WEBPACK_IMPORTED_MODULE_0__/* .dbClient */ .KC)(data);
        if (!db || db.status === false) return resolve(data);
        if (data.request) data.array = data.request;
        let databases = data.database;
        if (!Array.isArray(databases)) databases = [databases];
        let databasesLength = databases.length;
        for (let database of databases) {
          if (method === "read") {
            const sql = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
            process.emit("usage", {
              type: "egress",
              data: { sql },
              organization_id: data.organization_id
            });
            const res = await db.execute(sql);
            process.emit("usage", {
              type: "ingress",
              data: res.rows,
              organization_id: data.organization_id
            });
            for (let row of res.rows) {
              const tableObj = { name: row.name };
              if (data.$filter && data.$filter.query) {
                let isFilter = queryData(tableObj, data.$filter.query);
                if (isFilter) {
                  arrayArray.push({
                    name: row.name,
                    database,
                    storage: storageName
                  });
                }
              } else {
                arrayArray.push({
                  name: row.name,
                  database,
                  storage: storageName
                });
              }
            }
            databasesLength -= 1;
            if (!databasesLength) {
              data = (0,_utilities_js__WEBPACK_IMPORTED_MODULE_0__/* .createData */ .vd)(data, arrayArray, type);
              resolve(data);
            }
          } else {
            let arrays = data.array;
            if (method === "update") arrays = Object.entries(data.array);
            if (!Array.isArray(arrays)) arrays = [arrays];
            let arraysLength = arrays.length;
            for (let array2 of arrays) {
              if (method === "create") {
                const sql = \`
									CREATE TABLE IF NOT EXISTS "\${array2}" (
										_id TEXT PRIMARY KEY,
										organization_id TEXT,
										data TEXT DEFAULT '{}',
										created TEXT,
										updated TEXT
									);
								\`;
                process.emit("usage", {
                  type: "egress",
                  data: { sql },
                  organization_id: data.organization_id
                });
                await db.execute(sql);
                arrayArray.push({
                  name: array2,
                  database,
                  storage: storageName
                });
                arraysLength -= 1;
                if (!arraysLength) databasesLength -= 1;
                if (!databasesLength && !arraysLength) {
                  data = (0,_utilities_js__WEBPACK_IMPORTED_MODULE_0__/* .createData */ .vd)(data, arrayArray, type);
                  resolve(data);
                }
              } else {
                if (method === "update") {
                  let [oldName, newName] = array2;
                  const sql = \`ALTER TABLE "\${oldName}" RENAME TO "\${newName}";\`;
                  process.emit("usage", {
                    type: "egress",
                    data: { sql },
                    organization_id: data.organization_id
                  });
                  await db.execute(sql);
                  arrayArray.push({
                    name: newName,
                    oldName,
                    database,
                    storage: storageName
                  });
                  arraysLength -= 1;
                  if (!arraysLength) databasesLength -= 1;
                  if (!databasesLength && !arraysLength) {
                    data = (0,_utilities_js__WEBPACK_IMPORTED_MODULE_0__/* .createData */ .vd)(data, arrayArray, type);
                    resolve(data);
                  }
                }
                if (method === "delete") {
                  const sql = \`DROP TABLE IF EXISTS "\${array2}";\`;
                  process.emit("usage", {
                    type: "egress",
                    data: { sql },
                    organization_id: data.organization_id
                  });
                  await db.execute(sql);
                  arrayArray.push({
                    name: array2,
                    database,
                    storage: storageName
                  });
                  arraysLength -= 1;
                  if (!arraysLength) databasesLength -= 1;
                  if (!databasesLength && !arraysLength) {
                    data = (0,_utilities_js__WEBPACK_IMPORTED_MODULE_0__/* .createData */ .vd)(data, arrayArray, type);
                    resolve(data);
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        ;(0,_utilities_js__WEBPACK_IMPORTED_MODULE_0__/* .errorHandler */ .r_)(data, error);
        console.log(method, "error", error);
        resolve(data);
      }
    },
    (error) => {
      (0,_utilities_js__WEBPACK_IMPORTED_MODULE_0__/* .errorHandler */ .r_)(data, error);
    }
  );
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (array);

/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 52
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _utilities_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(561);


function database(method, data) {
  const storageName = data.storageConfig?.name;
  return new Promise(
    async (resolve, reject) => {
      let type = "database";
      let databaseArray = [];
      try {
        const db = await (0,_utilities_js__WEBPACK_IMPORTED_MODULE_0__/* .dbClient */ .KC)(data);
        if (!db || db.status === false) return resolve(data);
        if (method === "read") {
          const sql = "PRAGMA database_list;";
          process.emit("usage", {
            type: "egress",
            data: { sql },
            organization_id: data.organization_id
          });
          const res = await db.execute(sql);
          process.emit("usage", {
            type: "ingress",
            data: res.rows,
            organization_id: data.organization_id
          });
          for (let row of res.rows) {
            const dbObj = { name: row.file ? row.file.split("/").pop() : "memory" };
            if (data.$filter && data.$filter.query) {
              let isFilter = queryData(dbObj, data.$filter.query);
              if (isFilter) {
                databaseArray.push({
                  database: dbObj,
                  storage: storageName
                });
              }
            } else {
              databaseArray.push({
                database: dbObj,
                storage: storageName
              });
            }
          }
          resolve((0,_utilities_js__WEBPACK_IMPORTED_MODULE_0__/* .createData */ .vd)(data, databaseArray, type));
        }
        if (method === "delete") {
          const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table';");
          for (let t of tables.rows) {
            if (!t.name.startsWith("sqlite_")) {
              const sql = \`DROP TABLE IF EXISTS "\${t.name}";\`;
              process.emit("usage", {
                type: "egress",
                data: { sql },
                organization_id: data.organization_id
              });
              await db.execute(sql);
            }
          }
          resolve({ status: true });
        }
      } catch (error) {
        ;(0,_utilities_js__WEBPACK_IMPORTED_MODULE_0__/* .errorHandler */ .r_)(data, error);
        console.log(method, "error", error);
        resolve(data);
      }
    },
    (error) => {
      (0,_utilities_js__WEBPACK_IMPORTED_MODULE_0__/* .errorHandler */ .r_)(data, error);
    }
  );
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (database);

/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 625
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* unused harmony export send */
/* harmony import */ var _database_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(52);
/* harmony import */ var _array_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(832);
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(730);



async function send(data) {
  if (!data || !data.method) {
    throw new Error("Invalid request: missing method property.");
  }
  const [type, method] = data.method.split(".");
  if (type === "database") return await (0,_database_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .A)(method, data);
  if (type === "array") return await (0,_array_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .A)(method, data);
  if (type === "object") return await (0,_object_js__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A)(method, data);
  throw new Error(\`Unsupported query target type: "\${type}" in method "\${data.method}"\`);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({ send });

/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 730
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony import */ var _cocreate_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var _cocreate_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(706);
/* harmony import */ var _utilities_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(561);


function object(method, data) {
  const storageName = data.storageConfig?.name;
  return new Promise(
    async (resolve, reject) => {
      try {
        const db = await (0,_utilities_js__WEBPACK_IMPORTED_MODULE_2__/* .dbClient */ .KC)(data);
        if (!db || db.status === false) return resolve(data);
        let type = "object";
        let documents = [];
        if (!data["timeStamp"]) {
          data["timeStamp"] = (/* @__PURE__ */ new Date()).toISOString();
        }
        let databases = data.database;
        if (!Array.isArray(databases)) databases = [databases];
        for (let database of databases) {
          let arrays = data.array;
          if (!Array.isArray(arrays)) arrays = [arrays];
          for (let array of arrays) {
            const reference = {
              $storage: storageName,
              $database: database,
              $array: array
            };
            if (!data[type]) data[type] = [];
            else if (typeof data[type] === "string")
              data[type] = [{ _id: data[type] }];
            else if (!Array.isArray(data[type]))
              data[type] = [data[type]];
            let isFilter = !!data.$filter;
            if (isFilter && !data[type].length || data.isFilter) {
              data[type].splice(0, 0, { isFilter: "isEmptyObjectFilter" });
            }
            for (let i = 0; i < data[type].length; i++) {
              let $storage = data[type][i].$storage || [];
              let $database = data[type][i].$database || [];
              let $array = data[type][i].$array || [];
              if (!Array.isArray($storage)) $storage = [data[type][i].$storage];
              if (!Array.isArray($database)) $database = [data[type][i].$database];
              if (!Array.isArray($array)) $array = [data[type][i].$array];
              if (!$storage.includes(storageName)) $storage.push(storageName);
              if (!$database.includes(database)) $database.push(database);
              if (!$array.includes(array)) $array.push(array);
              delete data[type][i].$storage;
              delete data[type][i].$database;
              delete data[type][i].$array;
              let queryFilter = isFilter ? data.$filter : data[type][i].$filter || null;
              let { sqlWhere, params } = compileFilterToSQL(queryFilter, data.organization_id);
              if (method === "create") {
                data[type][i] = replaceArray(data[type][i]);
                data[type][i] = (0,_cocreate_utils__WEBPACK_IMPORTED_MODULE_0__/* .dotNotationToObject */ .O)(data[type][i]);
                const id = data[type][i]._id || \`row_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
                const orgId = data.organization_id;
                const created = {
                  on: new Date(data.timeStamp),
                  by: data.user_id || data.clientId
                };
                const recordPayload = { ...data[type][i] };
                delete recordPayload._id;
                delete recordPayload.organization_id;
                const sql = \`
									INSERT INTO "\${array}" (_id, organization_id, data, created, updated)
									VALUES (?, ?, ?, ?, NULL);
								\`;
                const queryParams = [id, orgId, JSON.stringify(recordPayload), JSON.stringify(created)];
                process.emit("usage", {
                  type: "egress",
                  data: { sql, queryParams },
                  organization_id: data.organization_id
                });
                await db.execute({ sql, args: queryParams });
                const createdDoc = await db.execute({
                  sql: \`SELECT * FROM "\${array}" WHERE _id = ? AND organization_id = ?\`,
                  args: [id, orgId]
                });
                if (createdDoc.rows.length > 0) {
                  const formattedDoc = parseSqlRow(createdDoc.rows[0]);
                  data[type][i] = { ...formattedDoc, $storage, $database, $array };
                }
              } else if (method === "read") {
                let sql = \`SELECT * FROM "\${array}" \${sqlWhere}\`;
                if (data.$filter && data.$filter.sort) {
                  const sortClauses = data.$filter.sort.map((s) => {
                    let dir = s.direction === -1 || s.direction === "desc" ? "DESC" : "ASC";
                    if (["_id", "organization_id"].includes(s.key)) {
                      return \`"\${s.key}" \${dir}\`;
                    }
                    return \`json_extract(data, '$.\${s.key}') \${dir}\`;
                  });
                  sql += \` ORDER BY \${sortClauses.join(", ")}\`;
                }
                if (data.$filter && typeof data.$filter.limit === "number") {
                  sql += \` LIMIT \${data.$filter.limit}\`;
                }
                if (data.$filter && typeof data.$filter.index === "number") {
                  sql += \` OFFSET \${data.$filter.index}\`;
                }
                if (data[type][i]._id && !isFilter) {
                  sql = \`SELECT * FROM "\${array}" WHERE _id = ? AND organization_id = ?\`;
                  params = [data[type][i]._id, data.organization_id];
                }
                process.emit("usage", {
                  type: "egress",
                  data: { sql, params },
                  organization_id: data.organization_id
                });
                const result = await db.execute({ sql, args: params });
                process.emit("usage", {
                  type: "ingress",
                  data: result.rows,
                  organization_id: data.organization_id
                });
                if (isFilter) {
                  for (let row of result.rows) {
                    const parsedRow = parseSqlRow(row);
                    if (data.$filter && data.$filter.search) {
                      let isMatch = (0,_cocreate_utils__WEBPACK_IMPORTED_MODULE_1__/* .searchData */ .Nw)(parsedRow, data.$filter.search);
                      if (!isMatch) continue;
                    }
                    documents.push({
                      ...parsedRow,
                      ...reference
                    });
                  }
                } else if (result.rows.length > 0) {
                  let dbRecord = parseSqlRow(result.rows[0]);
                  if ($storage.length && data[type][i].updated && data[type][i].updated.on) {
                    let clientTime = new Date(data[type][i].updated.on);
                    let dbTime = new Date(dbRecord.updated ? dbRecord.updated.on : 0);
                    if (clientTime > dbTime) {
                      const updatedRecord = { ...dbRecord, ...data[type][i] };
                      const savedRecord = await executeUpdateTransaction(db, array, data[type][i]._id, updatedRecord, data);
                      data[type][i] = { ...savedRecord, $storage, $database, $array };
                    } else {
                      data[type][i] = { ...data[type][i], ...dbRecord, $storage, $database, $array };
                    }
                  } else {
                    data[type][i] = {
                      ...data[type][i],
                      ...dbRecord,
                      $storage,
                      $database,
                      $array
                    };
                  }
                } else {
                  data[type].splice(i, 1);
                  i--;
                }
              } else if (method === "update") {
                const updatePayload = { ...data[type][i] };
                delete updatePayload._id;
                delete updatePayload.$filter;
                if (data[type][i]._id) {
                  const updatedDoc = await executeUpdateTransaction(db, array, data[type][i]._id, updatePayload, data);
                  if (updatedDoc) {
                    data[type][i] = { ...updatedDoc, $storage, $database, $array };
                  }
                } else if (isFilter) {
                  const selectSql = \`SELECT _id FROM "\${array}" \${sqlWhere}\`;
                  process.emit("usage", {
                    type: "egress",
                    data: { selectSql, params },
                    organization_id: data.organization_id
                  });
                  const selectResult = await db.execute({ sql: selectSql, args: params });
                  for (let row of selectResult.rows) {
                    const updatedDoc = await executeUpdateTransaction(db, array, row._id, updatePayload, data);
                    if (updatedDoc) {
                      documents.push({ ...updatedDoc, ...reference });
                    }
                  }
                }
              } else if (method === "delete") {
                let sql, queryParams;
                if (data[type][i]._id) {
                  sql = \`DELETE FROM "\${array}" WHERE _id = ? AND organization_id = ?;\`;
                  queryParams = [data[type][i]._id, data.organization_id];
                } else if (isFilter) {
                  sql = \`DELETE FROM "\${array}" \${sqlWhere};\`;
                  queryParams = params;
                }
                if (sql) {
                  process.emit("usage", {
                    type: "egress",
                    data: { sql, queryParams },
                    organization_id: data.organization_id
                  });
                  const runResult = await db.execute({ sql, args: queryParams });
                  process.emit("usage", {
                    type: "ingress",
                    data: runResult,
                    organization_id: data.organization_id
                  });
                  if (isFilter) {
                    documents.push({ _id: data[type][i]._id, ...reference });
                  } else {
                    data[type][i] = { _id: data[type][i]._id, $storage, $database, $array };
                  }
                }
              }
            }
          }
        }
        data = (0,_utilities_js__WEBPACK_IMPORTED_MODULE_2__/* .createData */ .vd)(data, documents, type);
        resolve(data);
      } catch (error) {
        ;(0,_utilities_js__WEBPACK_IMPORTED_MODULE_2__/* .errorHandler */ .r_)(data, error);
        console.log(method, "error", error);
        resolve(data);
      }
    },
    (error) => {
      (0,_utilities_js__WEBPACK_IMPORTED_MODULE_2__/* .errorHandler */ .r_)(data, error);
    }
  );
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (object);

/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ ]);


/***/ },

/***/ 561
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KC: () => (/* binding */ dbClient),
/* harmony export */   r_: () => (/* binding */ errorHandler),
/* harmony export */   vd: () => (/* binding */ createData)
/* harmony export */ });
/* unused harmony import specifier */ var queryData;
Object(function webpackMissingModule() { const e = new Error("Cannot find module '@libsql/client'"); e.code = 'MODULE_NOT_FOUND'; throw e; }());


const organizations = {};
async function dbClient(data) {
  const storageUrl = data.storageConfig?.url;
  if (storageUrl) {
    if (!organizations[data.organization_id]) {
      organizations[data.organization_id] = {};
    }
    try {
      if (!organizations[data.organization_id][storageUrl]) {
        const connectionPromise = (async () => {
          let config = { url: storageUrl };
          if (data.authToken || data.auth_token) {
            config.authToken = data.authToken || data.auth_token;
          }
          const client = Object(function webpackMissingModule() { const e = new Error("Cannot find module '@libsql/client'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())(config);
          await client.execute("SELECT 1;");
          return client;
        })();
        organizations[data.organization_id][storageUrl] = connectionPromise;
      }
      return await organizations[data.organization_id][storageUrl];
    } catch (error) {
      console.error(
        \`\${data.organization_id}: Connection failed using @libsql/client\`
      );
      errorHandler(data, error);
      return { status: false };
    }
  }
  errorHandler(data, "missing StorageUrl");
  return;
}
process.on("orgDeleted", (organization_id) => {
  const orgPools = organizations[organization_id];
  if (orgPools) {
    console.log(\`[libSQL Utilities] Cleanup Scheduled: Initiating 5-second grace period for Org: \${organization_id}\`);
    setTimeout(async () => {
      const currentPools = organizations[organization_id];
      if (!currentPools) return;
      console.log(\`[libSQL Utilities] Cleanup Executing: Closing connection clients for Org: \${organization_id}\`);
      const dbList = Object.values(currentPools);
      for (const dbPromise of dbList) {
        try {
          const db = await dbPromise;
          if (db && typeof db.close === "function") {
            db.close();
          }
        } catch (err) {
          console.error(\`[libSQL Utilities] Error closing connection for Org \${organization_id}:\`, err);
        }
      }
      delete organizations[organization_id];
      console.log(\`[libSQL Utilities] Memory Cleared: Registry freed for Org: \${organization_id}\`);
    }, 5e3);
  }
});
async function executeUpdateTransaction(db, arrayName, docId, rawUpdateInput, requestData) {
  try {
    const selectSql = \`SELECT * FROM "\${arrayName}" WHERE _id = ? AND organization_id = ?;\`;
    const tx = await db.transaction("deferred");
    const currentRecordRaw = await tx.execute({ sql: selectSql, args: [docId, requestData.organization_id] });
    let currentRecord = currentRecordRaw.rows.length > 0 ? parseSqlRow(currentRecordRaw.rows[0]) : null;
    if (!currentRecord) {
      if (requestData.upsert || rawUpdateInput.upsert || rawUpdateInput.$upsert) {
        currentRecord = { _id: docId, organization_id: requestData.organization_id };
      } else {
        await tx.rollback();
        return null;
      }
    }
    const updated = {
      on: new Date(requestData.timeStamp),
      by: requestData.user_id || requestData.clientId
    };
    const updatedPayload = applyMongoUpdate(currentRecord, rawUpdateInput);
    const savePayload = { ...updatedPayload };
    delete savePayload._id;
    delete savePayload.organization_id;
    delete savePayload.created;
    delete savePayload.updated;
    const updateSql = \`
			UPDATE "\${arrayName}"
			SET data = ?,
			    updated = ?
			WHERE _id = ? AND organization_id = ?;
		\`;
    const updateParams = [JSON.stringify(savePayload), JSON.stringify(updated), docId, requestData.organization_id];
    process.emit("usage", {
      type: "egress",
      data: { sql: updateSql, updateParams },
      organization_id: requestData.organization_id
    });
    await tx.execute({ sql: updateSql, args: updateParams });
    await tx.commit();
    const finalRecordRaw = await db.execute({ sql: selectSql, args: [docId, requestData.organization_id] });
    return parseSqlRow(finalRecordRaw.rows[0]);
  } catch (error) {
    throw error;
  }
}
function applyMongoUpdate(record, updatePayload) {
  let target = { ...record };
  Object.keys(updatePayload).forEach((rawKey) => {
    if (rawKey.startsWith("$")) return;
    let cleanKey = rawKey.replace(/\\[(\\d+)\\]/g, ".$1");
    setNestedValue(target, cleanKey, updatePayload[rawKey]);
  });
  if (updatePayload.$set) {
    Object.keys(updatePayload.$set).forEach((key) => {
      let cleanKey = key.replace(/\\[(\\d+)\\]/g, ".$1");
      setNestedValue(target, cleanKey, updatePayload.$set[key]);
    });
  }
  if (updatePayload.$unset) {
    Object.keys(updatePayload.$unset).forEach((key) => {
      let cleanKey = key.replace(/\\[(\\d+)\\]/g, ".$1");
      deleteNestedValue(target, cleanKey);
    });
  }
  if (updatePayload.$inc) {
    Object.keys(updatePayload.$inc).forEach((key) => {
      let cleanKey = key.replace(/\\[(\\d+)\\]/g, ".$1");
      let currentVal = getNestedValue(target, cleanKey) || 0;
      setNestedValue(target, cleanKey, Number(currentVal) + Number(updatePayload.$inc[key]));
    });
  }
  if (updatePayload.$push) {
    Object.keys(updatePayload.$push).forEach((key) => {
      let cleanKey = key.replace(/\\[(\\d+)\\]/g, ".$1");
      let arr = getNestedValue(target, cleanKey);
      if (!Array.isArray(arr)) arr = [];
      const pushValue = updatePayload.$push[key];
      if (pushValue && pushValue.$each) {
        let valuesToPush = pushValue.$each;
        let position = typeof pushValue.$position === "number" ? pushValue.$position : arr.length;
        arr.splice(position, 0, ...valuesToPush);
      } else {
        arr.push(pushValue);
      }
      setNestedValue(target, cleanKey, arr);
    });
  }
  if (updatePayload.$pull) {
    Object.keys(updatePayload.$pull).forEach((key) => {
      let cleanKey = key.replace(/\\[(\\d+)\\]/g, ".$1");
      let arr = getNestedValue(target, cleanKey);
      if (Array.isArray(arr)) {
        const filterVal = updatePayload.$pull[key];
        arr = arr.filter((item) => {
          if (typeof filterVal === "object" && filterVal !== null) {
            return !queryData(item, filterVal);
          }
          return item !== filterVal;
        });
        setNestedValue(target, cleanKey, arr);
      }
    });
  }
  if (updatePayload.$addToSet) {
    Object.keys(updatePayload.$addToSet).forEach((key) => {
      let cleanKey = key.replace(/\\[(\\d+)\\]/g, ".$1");
      let arr = getNestedValue(target, cleanKey);
      if (!Array.isArray(arr)) arr = [];
      const addValue = updatePayload.$addToSet[key];
      if (addValue && addValue.$each) {
        addValue.$each.forEach((item) => {
          if (!arr.includes(item)) arr.push(item);
        });
      } else {
        if (!arr.includes(addValue)) arr.push(addValue);
      }
      setNestedValue(target, cleanKey, arr);
    });
  }
  return target;
}
function compileFilterToSQL(filter, organizationId) {
  let clauses = ["organization_id = ?"];
  let params = [organizationId];
  if (filter && filter.query) {
    const parseConditionGroup = (queryObj, isOrJoin = false) => {
      let localClauses = [];
      if (queryObj.$or && Array.isArray(queryObj.$or)) {
        let orClauses = queryObj.$or.map((subQuery) => parseConditionGroup(subQuery)).filter((c) => c.length);
        if (orClauses.length) {
          localClauses.push("(" + orClauses.join(" OR ") + ")");
        }
      }
      if (queryObj.$and && Array.isArray(queryObj.$and)) {
        let andClauses = queryObj.$and.map((subQuery) => parseConditionGroup(subQuery)).filter((c) => c.length);
        if (andClauses.length) {
          localClauses.push("(" + andClauses.join(" AND ") + ")");
        }
      }
      for (let key in queryObj) {
        if (["$or", "$and"].includes(key)) continue;
        let value = queryObj[key];
        const targetField = ["_id", "organization_id"].includes(key) ? \`"\${key}"\` : \`json_extract(data, '$.\${key}')\`;
        if (value && typeof value === "object" && !Array.isArray(value)) {
          for (let op in value) {
            let operand = value[op];
            params.push(operand);
            if (op === "$gt") localClauses.push(\`\${targetField} > ?\`);
            else if (op === "$gte") localClauses.push(\`\${targetField} >= ?\`);
            else if (op === "$lt") localClauses.push(\`\${targetField} < ?\`);
            else if (op === "$lte") localClauses.push(\`\${targetField} <= ?\`);
            else if (op === "$ne") localClauses.push(\`\${targetField} != ?\`);
            else if (op === "$in") {
              params.pop();
              const placeholders = operand.map(() => "?").join(", ");
              operand.forEach((o) => params.push(o));
              localClauses.push(\`\${targetField} IN (\${placeholders})\`);
            }
          }
        } else {
          params.push(value);
          localClauses.push(\`\${targetField} = ?\`);
        }
      }
      return localClauses.join(isOrJoin ? " OR " : " AND ");
    };
    const processedQuery = parseConditionGroup(filter.query);
    if (processedQuery) {
      clauses.push(processedQuery);
    }
  }
  return {
    sqlWhere: clauses.length > 0 ? "WHERE " + clauses.join(" AND ") : "",
    params
  };
}
function parseSqlRow(row) {
  if (!row) return null;
  const recordData = typeof row.data === "string" ? JSON.parse(row.data) : row.data || {};
  return {
    _id: row._id,
    organization_id: row.organization_id,
    created: typeof row.created === "string" ? JSON.parse(row.created) : row.created,
    updated: typeof row.updated === "string" ? JSON.parse(row.updated) : row.updated,
    ...recordData
  };
}
function replaceArray(data = {}) {
  let object = {};
  Object.keys(data).forEach((key) => {
    object[key.replace(/\\[(\\d+)\\]/g, ".$1")] = data[key];
  });
  return object;
}
function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}
function setNestedValue(obj, path, value) {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((acc, part) => acc[part] = acc[part] || {}, obj);
  target[last] = value;
}
function deleteNestedValue(obj, path) {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((acc, part) => acc && acc[part], obj);
  if (target) delete target[last];
}
function createData(data, array, type) {
  if (data[type] && data[type][0] && data[type][0].isFilter === "isEmptyObjectFilter") {
    data[type].shift();
    data.isFilter = true;
  }
  let key = type !== "object" ? "name" : "_id";
  if (!Array.isArray(data[type])) {
    console.log("data[type] is not an array", type);
  } else {
    for (let i = 0; i < array.length; i++) {
      const matchIndex = data[type].findIndex((item) => item[key] === array[i][key]);
      if (matchIndex !== -1) {
        for (let $type of ["$storage", "$database", "$array"]) {
          if (!data[type][matchIndex][$type]) data[type][matchIndex][$type] = [];
          if (!Array.isArray(data[type][matchIndex][$type])) {
            data[type][matchIndex][$type] = [data[type][matchIndex][$type]];
          }
          if (!data[type][matchIndex][$type].includes(array[i][$type])) {
            data[type][matchIndex][$type].push(array[i][$type]);
          }
          delete array[i][$type];
        }
        data[type][matchIndex] = { ...data[type][matchIndex], ...array[i] };
      } else {
        data[type].push(array[i]);
      }
    }
  }
  return data;
}
function errorHandler(data, error, database, array) {
  let errorMessage = typeof error === "object" && error.message ? error.message : error;
  let errorObject = {
    message: errorMessage,
    storage: "sqlite"
  };
  if (database) errorObject.database = database;
  if (array) errorObject.array = array;
  if (Array.isArray(data.error)) {
    data.error.push(errorObject);
  } else {
    data.error = [errorObject];
  }
}



/***/ }

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ const __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	const cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	const module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ // define getter/value functions for harmony exports
/******/ __webpack_require__.d = (exports, definition) => {
/******/ 	if(Array.isArray(definition)) {
/******/ 		var i = 0;
/******/ 		while(i < definition.length) {
/******/ 			var key = definition[i++];
/******/ 			var binding = definition[i++];
/******/ 			var descriptor = binding === 0 ? { enumerable: true, value: definition[i++] } : { enumerable: true, get: binding };
/******/ 			if(!__webpack_require__.o(exports, key)) Object.defineProperty(exports, key, descriptor);
/******/ 		}
/******/ 	} else {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	}
/******/ };
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ 
/************************************************************************/
let __webpack_exports__ = {};
/* harmony import */ var _cocreate_sqlite__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(625);

const send = (data) => {
  return _cocreate_sqlite__WEBPACK_IMPORTED_MODULE_0__/* ["default"].send */ .A.send(data);
};
/* harmony default export */ const src = ({ send });

/* harmony export */ __webpack_require__.d(__webpack_exports__, [
/* harmony export */   "A", 0, /* export default binding */ src,
/* harmony export */   "t", 0, /* binding */ send
/* harmony export */ ]);

const __webpack_exports__default = __webpack_exports__.A;
export { __webpack_exports__default as default, send };
`,extractDatabase(){try{const e=r.join(process.cwd(),".storages"),a=r.join(e,"rqlite.js");t.existsSync(e)||t.mkdirSync(e,{recursive:!0}),t.existsSync(a)?console.log(`[Storage Boot] rQLite module present on disk at: ${a}`):this.payload?(console.log(`[Storage Boot] Extracting embedded database payload to: ${a}`),t.writeFileSync(a,this.payload,"utf8"),console.log("[Storage Boot] Database extraction complete.")):console.log("[Storage Boot] Database file missing, but no embedded payload present.")}catch(e){console.error("[Storage Boot Error] Failed to extract database payload:",e.message)}finally{this.payload=null}}};n&&(n.extractDatabase(),n=null);
