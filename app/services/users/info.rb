require 'httparty'
require 'nokogiri'

#move to resque background task
module Users
  class Info

    #sanitize topics before save to remove excess punctuation
    def self.get_topics(user: nil)
        site = HTTParty.get(user.website_url)
        parse_page = Nokogiri::HTML(site)
        @header1 = parse_page.css("h1")
        @header2 = parse_page.css("h2")
        @header3 = parse_page.css("h3")
        user.topics = get_headers
        user.save!
    end

    def self.get_headers
       headers = []
       @header1.children.each do |h|
         headers << h.text
       end if @header1.children.count > 0
       @header2.children.each do |h|
         headers << h.text
       end if @header2.children.count > 0
       @header3.children.each do |h|
         headers << h.text
       end if @header3.children.count > 0
       headers
     end

  end
end
