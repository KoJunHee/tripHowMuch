/*
* comments Controller
* Created by ikoobmacpro on 2017.09.28..
* Copyright (c) 2017 junhee. All rights reserved.
*/

'use strict';

var Boom = require('boom'),
    Joi = require('joi'),
    Config = require('../config'),
    Request = require('request'),
    Co = require('co');

/*********************************************************************** 
 *                     - 여행지 등록하기 (db 저장 위해 한 번 쓰임)
*************************************************************************/
// exports.create = {
//     description: '여행지 등록',
//     tags: ['api'],
//     validate: {
//         query: {
//             areaCode: Joi.number().default("")
//                 .valid(['1', '2', '3', '4', '5', '6', '7', '8', '31', '32', '33', '34', '35', '36', '37', '38', '39'])
//                 .description('지역 코드'),

//             sigunguCode: Joi.number().default("")
//                 .valid(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'])
//                 .description('시군구 코드'),

//             cat1: Joi.string().default("")
//                 .valid(['A01', 'A02'])
//                 .description('대분류'),

//             cat2: Joi.string().default("")
//                 .valid(['A0101', 'A0102'], ['A0201', 'A0202', 'A0203', 'A0204', 'A0205', 'A0206', 'A0207', 'A0208'])
//                 .description('중분류'),

//             pageNo: Joi.number().default(1)
//                 .description('페이지번호')
//         }
//     },
//     auth: false,
//     handler: function (request, reply) {

//         // make request url
//         var tourUrl = Config.openApi.baseUrl +
//             '/rest/KorService/areaBasedList' +
//             '?ServiceKey=' +
//             Config.openApi.myKey +
//             '&contentTypeId=12' +
//             '&areaCode=' +
//             request.query.areaCode +
//             '&sigunguCode=' +
//             request.query.sigunguCode +
//             '&cat1=' +
//             request.query.cat1 +
//             '&cat2=' +
//             request.query.cat2 +
//             '&cat3=' +
//             '&listYN=Y&MobileOS=ETC&MobileApp=tripHowMuch&_type=json&pageNo=' +
//             request.query.pageNo +
//             '&numOfRows=9547';

//         //tour api request  
//         Request({
//             method: 'GET',
//             uri: tourUrl
//         },
//             function (error, response, body) {
//                 if (error) {
//                     return console.error('upload failed:', error);
//                 }

//                 //검색한 자료를 배열로 저장
//                 var resultArr = JSON.parse(body).response.body.items.item;
//                 var objectArr = [];
//                 for (var itemIndex in resultArr) {
//                     objectArr.push({
//                         contentid: resultArr[itemIndex].contentid,
//                         title: resultArr[itemIndex].title,
//                         firstimage: resultArr[itemIndex].firstimage
//                     })
//                 }

//                 //검색한 자료를 디비에 저장
//                 Co(function* () {
//                     try {
//                         yield Area.create(objectArr);
//                     } catch (err) {
//                         throw err;
//                     }
//                 }).then(function () {
//                     console.log(objectArr.length + ' register finish');
//                 }).catch(function (err) {
//                     return reply(Boom.badImplementation(err));
//                 });
//             });
//     }
// };


/*********************************************************************** 
 *                              - 여행지 상세보기 (R)
*************************************************************************/
exports.find = {
    description: '여행지 상세보기 (R)',
    tags: ['api'],
    validate: {
        params: {
            contentid: Joi.string().required()
        }
    },
    auth: false,
    handler: function (request, reply) {

        //make request url
        var tourUrl = Config.openApi.baseUrl +
            '/rest/KorService/detailCommon' +
            '?ServiceKey=' +
            Config.openApi.myKey +
            '&contentTypeId=12' +
            '&contentId=' +
            request.params.contentid +
            '&MobileOS=ETC&MobileApp=tripHowMuch&' +
            '&defaultYN=Y&firstImageYN=Y&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&' +
            'overviewYN=Y&transGuideYN=Y&_type=json';

        //request tour api
        Request({
            method: 'GET',
            uri: tourUrl
        },
            function (error, response, body) {
                if (error) {
                    return console.error('upload failed:', error);
                }

                //가져온 정보
                var tempInfo = JSON.parse(body).response.body.items.item;
                console.log(tempInfo);

                //필요한 정보만 추출
                Co(function* () {
                    try {
                        var area = yield Area.findOne({ contentid: tempInfo.contentid });
                        var resultInfo = {
                            price: area.price,
                            overview: tempInfo.overview,
                            addr1: tempInfo.addr1,
                            addr2: tempInfo.addr2,
                            firstimage: tempInfo.firstimage,
                            title: tempInfo.title
                        }
                        return resultInfo;
                    }
                    catch (err) {
                        throw err;
                    }
                }).then(function (resultInfo) {
                    reply(resultInfo);
                }).catch(function (err) {
                    return reply(Boom.badImplementation(err));
                });
            })
    }
};

/*********************************************************************** 
 *                              - 여행지 정보 수정 (U)
*************************************************************************/
// exports.update = {
//     description: '여행지 정보 수정 (U)',
//     notes: ' ',
//     tags: ['api'],
//     validate: {
//         params: {
//             title: Joi.string().required()
//         },
//         payload: {
//             price: Joi.number().required()
//         }
//     },
//     auth: false,
//     handler: (request, reply) => {
//         // 수정
//         Area.update({ title: request.params.title }, request.payload)
//             .exec((err, area) => {
//                 // 결과
//                 if (err) {
//                     return reply(Boom.badImplementation(err));
//                 }
//                 reply(area);
//             });
//     }
// };

/*********************************************************************** 
 *                              - 여행지 검색
*************************************************************************/
exports.search = {
    description: '여행지 검색',
    tags: ['api'],
    validate: {
        query: {
            areaCode: Joi.number().default("")
                .valid(['1', '2', '3', '4', '5', '6', '7', '8', '31', '32', '33', '34', '35', '36', '37', '38', '39'])
                .description('지역 코드'),

            sigunguCode: Joi.number().default("")
                .valid(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'])
                .description('시군구 코드'),

            cat1: Joi.string().default("")
                .valid(['A01', 'A02'])
                .description('대분류'),

            cat2: Joi.string().default("")
                .valid(['A0101', 'A0102'], ['A0201', 'A0202', 'A0203', 'A0204', 'A0205', 'A0206', 'A0207', 'A0208'])
                .description('중분류'),

            pageNo: Joi.number().default(1)
                .description('페이지번호'),

            money: Joi.number().default(0)
                .description('예산')
        }
    },
    auth: false,
    handler: function (request, reply) {

        //make request url
        var tourUrl = Config.openApi.baseUrl +
            '/rest/KorService/areaBasedList' +
            '?ServiceKey=' +
            Config.openApi.myKey +
            '&contentTypeId=12' +
            '&areaCode=' +
            request.query.areaCode +
            '&sigunguCode=' +
            request.query.sigunguCode +
            '&cat1=' +
            request.query.cat1 +
            '&cat2=' +
            request.query.cat2 +
            '&cat3=' +
            '&listYN=Y&MobileOS=ETC&MobileApp=tripHowMuch&_type=json&pageNo=' +
            request.query.pageNo;

        //request tour api
        Request({
            method: 'GET',
            uri: tourUrl
        },
            function (error, response, body) {
                if (error) {
                    return console.error('upload failed:', error);
                }

                var tempArr = JSON.parse(body).response.body.items.item;
                var resultArr = [];

                //검색한 여행지들의 가격찾기
                Co(function* () {
                    try {
                        for (var itemIdex in tempArr) {
                            var area = yield Area.findOne({ contentid: tempArr[itemIdex].contentid });

                            //검색한 여행지의 가격이 예산이하이면
                            if (area.price <= request.query.money) {
                                var object = {
                                    contentid: area.contentid,
                                    titile: area.title,
                                    firstimage: area.firstimage,
                                    price: area.price
                                };
                                resultArr.push(object);
                            }

                        }
                        return resultArr;
                    } catch (err) {
                        throw err;
                    }
                }).then(function (resultArr) {
                    reply(resultArr);
                }).catch(function (err) {
                    return reply(Boom.badImplementation(err));
                });
            })
    }
};

