class AddUserIdAndCoordsToSearch < ActiveRecord::Migration[5.0]
  def change
    add_column :searches, :user_id, :int
    add_column :searches, :lat, :string
    add_column :searches, :lng, :string
  end
end
