/**
 * This script is use to automatically export the 微信公众号 article analysis to excel.
 *
 *  Step 1: Obtain the json file from this link, you can adjust the begin_date and end_date
 *  https://mp.weixin.qq.com/misc/appmsganalysis?action=all&begin_date=2018-05-01&end_date=2018-05-31&order_by=1&order_direction=2&token=850614115&lang=zh_CN&f=json&ajax=1&random=0.951008508459056 
 *  [TODO] Find a proper way to ensure the downloaded json data is strict.

 *  Step 2: Install nodejs
 * 
 *  Step 3: Invoke this script via node ./exportArticleToExcel.js data.json final.csv
 */

const fs = require('fs')
const jsonic = require('jsonic')
const _ = require("underscore")
const Json2csvParser = require('json2csv').Parser
/**
 * Only for test purpose.
 */
function toNeatJson(articles) {
    const neatArticles = _.map(articles, function(article) {
        return _.pick(article, "title", "publish_date", "target_user", "int_page_from_session_read_user", "feed_share_from_session_user", "msgid")
    })
    return neatArticles
}

function calcPercentage(articles) {
    const articlesWithPercentage = _.map(articles, function(article) {
        return _.extend(article, {
            "first_open_rate": (100.0 * article.int_page_from_session_read_user / article.target_user).toFixed(2),
            "second_open_rate": (100.0 * article.feed_share_from_session_user / article.int_page_from_session_read_user).toFixed(2),
            "banner" : article.msgid.endsWith("_1") ? 'Y' : 'N'
        })
    })
    return articlesWithPercentage
}
function saveAsCsv(articles, path) {
    const fields = [{
        label: '标题',
        value: 'title'
    },{
        label: '发布日期',
        value: 'publish_date'
    },{
        label: '头条（Y/N）',
        value: 'banner'
    },{
        label: '总用户人数',
        value: 'target_user'
    },{
        label: '一次打开人数',
        value: 'int_page_from_session_read_user'
    },{
        label: '分享人数',
        value: 'feed_share_from_session_user'
    },{
        label: '一次转化率（一次打开人数／总用户人数）',
        value: 'first_open_rate'
    },{
        label: '二次转化率（分享人数／一次打开人数）',
        value: 'second_open_rate'
    }];

    const parser = new Json2csvParser({
        fields,
        withBOM : true
    })
    const csv = parser.parse(articles)
    fs.writeFile(path, csv, 'utf8', function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The csv file was generated!")
    })
}
function main() {
    const args = process.argv.slice(2)
    const filename  = args[0]
    const destname  = args[1]
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) throw err // we'll not consider error handling for now
        const obj = jsonic(data)
        const articles = obj.total_article_data.list
        saveAsCsv(calcPercentage(toNeatJson(articles)), destname)
    })
}



main()