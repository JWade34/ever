class CreateUsers < ActiveRecord::Migration[5.1]
  def change
    create_table :users do |t|
      t.string :name
      t.string :website_url
      t.string :short_url
      t.text :topics
    end
  end
end
